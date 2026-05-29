const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,           // FIX: add index — most queries filter by student
    },
    books: [
      {
        book:      { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        issueDate: { type: Date, required: true },
        dueDate:   { type: Date, required: true },
        _id:       { type: mongoose.Schema.Types.ObjectId, auto: true },
      },
    ],
    returnedBooks: [
      {
        book:         { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
        returnedAt:   { type: Date, default: Date.now },
        issuedBookId: { type: mongoose.Schema.Types.ObjectId },
      },
    ],
  },
  { timestamps: true }
);

// Compound index: speeds up availability checks across issues
issueSchema.index({ "books.book": 1 });

module.exports = mongoose.model("Issue", issueSchema);
