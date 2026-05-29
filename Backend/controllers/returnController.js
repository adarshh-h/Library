const Issue = require("../models/Issue");
const User  = require("../models/User");
const Book  = require("../models/Book");

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id));

// ─── POST /api/returns ────────────────────────────────────────────────────────
const returnBook = async (req, res) => {
  try {
    const { studentId, issueId, issuedBookId } = req.body;

    if (!studentId || !issueId || !issuedBookId)
      return res.status(400).json({ success: false, message: "studentId, issueId, and issuedBookId are required." });

    if (!isValidObjectId(studentId) || !isValidObjectId(issueId) || !isValidObjectId(issuedBookId))
      return res.status(400).json({ success: false, message: "One or more IDs are invalid." });

    const issue = await Issue.findOne({ _id: issueId, student: studentId });
    if (!issue)
      return res.status(404).json({ success: false, message: "Issue record not found." });

    const bookEntry = issue.books.id(issuedBookId);
    if (!bookEntry)
      return res.status(404).json({ success: false, message: "Issued book entry not found." });

    const alreadyReturned = issue.returnedBooks.some(
      (r) => r.issuedBookId?.toString() === issuedBookId.toString()
    );
    if (alreadyReturned)
      return res.status(409).json({ success: false, message: "This book has already been returned." });

    const returnedAt = new Date();
    issue.returnedBooks.push({ book: bookEntry.book, returnedAt, issuedBookId });
    await issue.save();

    const isLate = returnedAt > new Date(bookEntry.dueDate);

    // Fire-and-forget email
    try {
      const { sendReturnConfirmation } = require("../services/emailService");
      const [student, book] = await Promise.all([
        User.findById(studentId).select("name email").lean(),
        Book.findById(bookEntry.book).select("bookName authorName").lean(),
      ]);
      if (student && book)
        sendReturnConfirmation(student, [book], { isLate }).catch(() => {});
    } catch (_) {}

    res.json({
      success: true,
      message: "Book returned successfully.",
      isLate,
      returnedAt,
    });
  } catch (err) {
    console.error("[Return] returnBook:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── GET /api/returns/student/:studentId ─────────────────────────────────────
const getUnreturnedBooks = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidObjectId(studentId))
      return res.status(400).json({ success: false, message: "Invalid student ID." });

    const issues = await Issue.find({ student: studentId })
      .populate("books.book", "bookName accessionNumber authorName")
      .lean();

    const now = new Date();
    const books = [];
    for (const issue of issues) {
      const returnedSet = new Set((issue.returnedBooks || []).map((r) => r.issuedBookId?.toString()));
      for (const b of issue.books) {
        if (!returnedSet.has(b._id.toString()) && b.book) {
          const dueDate = new Date(b.dueDate);
          books.push({
            _id:             b.book._id,
            bookName:        b.book.bookName,
            accessionNumber: b.book.accessionNumber,
            authorName:      b.book.authorName,
            issueId:         issue._id,
            issuedBookId:    b._id,
            issueDate:       b.issueDate,
            dueDate:         b.dueDate,
            isOverdue:       now > dueDate,
            daysOverdue:     now > dueDate ? Math.floor((now - dueDate) / 86400000) : 0,
          });
        }
      }
    }

    // Sort: overdue first, then by due date ascending
    books.sort((a, b) => (b.isOverdue - a.isOverdue) || (new Date(a.dueDate) - new Date(b.dueDate)));

    res.json({ success: true, books, total: books.length });
  } catch (err) {
    console.error("[Return] getUnreturnedBooks:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getUnreturnedBooks, returnBook };
