const Issue = require("../models/Issue");
const Book  = require("../models/Book");
const User  = require("../models/User");

const MAX_BOOKS = 10;
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// ─── GET /api/issues/book/:accessionNumber ────────────────────────────────────
const getBookDetails = async (req, res) => {
  try {
    const acc = req.params.accessionNumber?.trim().toUpperCase();
    if (!acc)
      return res.status(400).json({ success: false, message: "Accession number is required." });

    const book = await Book.findOne({ accessionNumber: acc }).lean();
    if (!book)
      return res.status(404).json({ success: false, message: "Book not found." });

    // Efficient availability check — single query, no loop-in-loop
    const issuedAndUnreturned = await Issue.aggregate([
      { $match: { "books.book": book._id } },
      { $unwind: "$books" },
      { $match: { "books.book": book._id } },
      {
        $lookup: {
          from:         "issues",
          localField:   "_id",
          foreignField: "_id",
          as:           "self",
        },
      },
      {
        $project: {
          issuedBookId: "$books._id",
          isReturned: {
            $in: ["$books._id", { $ifNull: ["$returnedBooks.issuedBookId", []] }],
          },
        },
      },
      { $match: { isReturned: false } },
      { $limit: 1 },
    ]);

    // Fallback to simpler check if aggregate returns nothing useful
    let isAvailable = true;
    if (issuedAndUnreturned.length === 0) {
      // Double check with simple populate
      const issues = await Issue.find({ "books.book": book._id });
      for (const issue of issues) {
        const returnedIds = new Set(issue.returnedBooks.map((r) => r.issuedBookId?.toString()));
        for (const b of issue.books) {
          if (b.book.toString() === book._id.toString() && !returnedIds.has(b._id.toString())) {
            isAvailable = false;
            break;
          }
        }
        if (!isAvailable) break;
      }
    }

    res.json({
      success: true,
      book: {
        _id: book._id, bookName: book.bookName, authorName: book.authorName,
        accessionNumber: book.accessionNumber, isAvailable,
      },
    });
  } catch (err) {
    console.error("[Issue] getBookDetails:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET /api/issues/student-by-roll/:rollNumber ──────────────────────────────
const getStudentDetails = async (req, res) => {
  try {
    const roll = req.params.rollNumber?.trim().toUpperCase();
    if (!roll)
      return res.status(400).json({ success: false, message: "Roll number is required." });

    const student = await User.findOne({ rollNumber: roll, role: "student" })
      .select("name rollNumber department batch email")
      .lean();
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found." });

    // Also return how many books the student currently holds
    const issueRecord = await Issue.findOne({ student: student._id }).lean();
    const currentlyHeld = issueRecord
      ? issueRecord.books.filter((b) => {
          const returnedIds = new Set(issueRecord.returnedBooks.map((r) => r.issuedBookId?.toString()));
          return !returnedIds.has(b._id.toString());
        }).length
      : 0;

    res.json({
      success: true,
      student: { ...student, currentlyHeld, slotsAvailable: MAX_BOOKS - currentlyHeld },
    });
  } catch (err) {
    console.error("[Issue] getStudentDetails:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── POST /api/issues/issue ───────────────────────────────────────────────────
const issueBooksToStudent = async (req, res) => {
  try {
    const { studentId, bookIds, issueDate, dueDate } = req.body;

    // Input validation
    if (!studentId || !Array.isArray(bookIds) || !bookIds.length || !issueDate || !dueDate)
      return res.status(400).json({ success: false, message: "studentId, bookIds[], issueDate, dueDate are all required." });

    if (!isValidObjectId(studentId))
      return res.status(400).json({ success: false, message: "Invalid studentId." });

    const invalidIds = bookIds.filter((id) => !isValidObjectId(id));
    if (invalidIds.length)
      return res.status(400).json({ success: false, message: `Invalid book ID(s): ${invalidIds.join(", ")}` });

    if (new Date(dueDate) <= new Date(issueDate))
      return res.status(400).json({ success: false, message: "Due date must be after issue date." });

    // Fetch student + books in parallel
    const [student, books] = await Promise.all([
      User.findById(studentId).lean(),
      Book.find({ _id: { $in: bookIds } }).lean(),
    ]);

    if (!student || student.role !== "student")
      return res.status(404).json({ success: false, message: "Student not found." });
    if (books.length !== bookIds.length)
      return res.status(404).json({ success: false, message: "One or more books not found." });

    // Current holdings check
    const existingIssue = await Issue.findOne({ student: studentId });
    const returnedIds   = new Set(existingIssue?.returnedBooks.map((r) => r.issuedBookId?.toString()) || []);
    const currentlyHeld = existingIssue
      ? existingIssue.books.filter((b) => !returnedIds.has(b._id.toString())).length
      : 0;

    if (currentlyHeld >= MAX_BOOKS)
      return res.status(400).json({
        success: false,
        message: `Student already holds ${currentlyHeld}/${MAX_BOOKS} book(s). No slots available.`,
        currentlyHeld, limit: MAX_BOOKS,
      });

    const slotsAvailable = MAX_BOOKS - currentlyHeld;
    if (bookIds.length > slotsAvailable)
      return res.status(400).json({
        success: false,
        message: `Only ${slotsAvailable} slot(s) available (limit ${MAX_BOOKS}).`,
        currentlyHeld, slotsAvailable, limit: MAX_BOOKS,
      });

    // Availability check across all issues
    const activeIssues  = await Issue.find({ "books.book": { $in: bookIds } });
    const unavailableIds = new Set();
    for (const issue of activeIssues) {
      const returned = new Set(issue.returnedBooks.map((r) => r.issuedBookId?.toString()));
      for (const b of issue.books) {
        if (bookIds.map(String).includes(b.book.toString()) && !returned.has(b._id.toString()))
          unavailableIds.add(b.book.toString());
      }
    }

    const availableBooks = books.filter((b) => !unavailableIds.has(b._id.toString()));
    if (!availableBooks.length)
      return res.status(400).json({ success: false, message: "All selected books are currently issued to other students." });

    const skipped        = books.length - availableBooks.length;
    const newBookEntries = availableBooks.map((b) => ({ book: b._id, issueDate, dueDate }));

    let issueRecord = existingIssue;
    if (issueRecord) { issueRecord.books.push(...newBookEntries); await issueRecord.save(); }
    else              { issueRecord = await new Issue({ student: studentId, books: newBookEntries }).save(); }

    // Fire-and-forget email
    try {
      const { sendIssueConfirmation } = require("../services/emailService");
      sendIssueConfirmation(student, availableBooks, dueDate).catch(() => {});
    } catch (_) {}

    res.status(201).json({
      success: true,
      message: skipped > 0
        ? `${availableBooks.length} book(s) issued. ${skipped} skipped (already issued).`
        : "Books issued successfully.",
      issuedCount: availableBooks.length,
      skippedCount: skipped,
      currentlyHeld: currentlyHeld + availableBooks.length,
    });
  } catch (err) {
    console.error("[Issue] issueBooksToStudent:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getBookDetails, getStudentDetails, issueBooksToStudent };
