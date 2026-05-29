const express = require("express");
const multer  = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  getAllBooks,
  updateBook,
  deleteBook,
  bulkImportBooksCSV,
} = require("../controllers/bookController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public
router.get("/", getAllBooks);

// Librarian only
router.put("/:id",             protect("librarian"), updateBook);
router.delete("/:id",          protect("librarian"), deleteBook);
router.post("/bulk-import",    protect("librarian"), upload.single("file"), bulkImportBooksCSV);

module.exports = router;
