const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const Issue = require("../models/Issue");
const { getProfile, updateProfile, changePassword } = require("../controllers/profileController");

const router = express.Router();

// ── Profile ───────────────────────────────────────────────────────────────────
router.get("/profile",          protect("student"), getProfile);
router.put("/profile",          protect("student"), updateProfile);
router.post("/change-password", protect("student"), changePassword);

// ── Issued books (currently unreturned) ──────────────────────────────────────
router.get("/issued-books", protect("student"), async (req, res) => {
  try {
    const issues = await Issue.find({ student: req.user._id })
      .populate("books.book", "bookName accessionNumber authorName")
      .lean();

    const books = [];
    for (const issue of issues) {
      const returnedSet = new Set(
        (issue.returnedBooks || []).map((r) => r.issuedBookId?.toString())
      );
      for (const b of issue.books) {
        if (!returnedSet.has(b._id.toString())) {
          books.push({
            _id:            b.book._id,
            bookName:       b.book.bookName,
            accessionNumber:b.book.accessionNumber,
            authorName:     b.book.authorName,
            issueId:        issue._id,
            issuedBookId:   b._id,
            issueDate:      b.issueDate,
            dueDate:        b.dueDate,
            isOverdue:      new Date() > new Date(b.dueDate),
          });
        }
      }
    }

    res.json({ success: true, books });
  } catch (err) {
    console.error("[Student] issued-books:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch issued books." });
  }
});

// ── Full transaction history ──────────────────────────────────────────────────
router.get("/history", protect("student"), async (req, res) => {
  try {
    const issues = await Issue.find({ student: req.user._id })
      .populate("books.book", "bookName accessionNumber authorName")
      .sort({ createdAt: -1 })
      .lean();

    const transactions = [];
    for (const issue of issues) {
      const returnedMap = new Map(
        (issue.returnedBooks || [])
          .filter((r) => r.issuedBookId)
          .map((r) => [r.issuedBookId.toString(), r.returnedAt])
      );
      for (const b of issue.books) {
        const key = b._id.toString();
        transactions.push({
          book:       b.book,
          issueId:    issue._id,
          issuedBookId: b._id,
          issueDate:  b.issueDate,
          dueDate:    b.dueDate,
          returned:   returnedMap.has(key),
          returnedAt: returnedMap.get(key) || null,
          isOverdue:  !returnedMap.has(key) && new Date() > new Date(b.dueDate),
        });
      }
    }

    res.json({ success: true, transactions });
  } catch (err) {
    console.error("[Student] history:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch history." });
  }
});

module.exports = router;
