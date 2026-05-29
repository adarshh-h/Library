const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    accessionNumber: { type: String, required: true, unique: true, trim: true, index: true },
    authorName:      { type: String, required: true, trim: true },
    bookName:        { type: String, required: true, trim: true },
    category:        { type: String, required: true, trim: true },
    publication:     { type: String, required: true, trim: true },
    year:            { type: Number, required: true },
    totalPages:      { type: Number, required: true },
    supplier:        { type: String, required: true, trim: true },
    price:           { type: Number, required: true },
    addedBy:         { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Text index for full-text search on common fields
BookSchema.index({ bookName: "text", authorName: "text", category: "text" });

module.exports = mongoose.model("Book", BookSchema);
