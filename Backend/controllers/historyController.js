const Issue = require("../models/Issue");
const User  = require("../models/User");

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// ─── GET /api/history/history/:studentId ─────────────────────────────────────
const getIssueReturnHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId))
      return res.status(400).json({ success: false, message: "Invalid student ID." });

    const [student, issues] = await Promise.all([
      User.findOne({ _id: studentId, role: "student" })
        .select("name rollNumber department batch email")
        .lean(),
      Issue.find({ student: studentId })
        .populate("books.book", "bookName accessionNumber authorName")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    if (!student)
      return res.status(404).json({ success: false, message: "Student not found." });

    const now = new Date();
    const transactions = [];

    for (const issue of issues) {
      const returnedMap = new Map(
        (issue.returnedBooks || [])
          .filter((rb) => rb.issuedBookId)
          .map((rb) => [rb.issuedBookId.toString(), rb.returnedAt])
      );

      for (const b of issue.books) {
        if (!b.book) continue; // guard against deleted books
        const key      = b._id.toString();
        const returned = returnedMap.has(key);
        const dueDate  = new Date(b.dueDate);

        transactions.push({
          bookName:        b.book.bookName,
          accessionNumber: b.book.accessionNumber,
          authorName:      b.book.authorName,
          bookId:          b.book._id,
          issueId:         issue._id,
          issuedBookId:    key,
          issueDate:       b.issueDate,
          dueDate:         b.dueDate,
          returned,
          returnedAt:      returnedMap.get(key) || null,
          isOverdue:       !returned && now > dueDate,
          daysOverdue:     !returned && now > dueDate ? Math.floor((now - dueDate) / 86400000) : 0,
        });
      }
    }

    res.json({
      success: true,
      student,
      transactions,
      summary: {
        total:    transactions.length,
        returned: transactions.filter((t) => t.returned).length,
        pending:  transactions.filter((t) => !t.returned).length,
        overdue:  transactions.filter((t) => t.isOverdue).length,
      },
    });
  } catch (err) {
    console.error("[History] getIssueReturnHistory:", err.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getIssueReturnHistory };
