const express = require("express");
const router = express.Router();
const { getUnreturnedBooks, returnBook } = require("../controllers/returnController");
const { protect } = require("../middleware/authMiddleware");

router.get("/student/:studentId", protect("librarian"), getUnreturnedBooks);
router.post("/", protect("librarian"), returnBook);

module.exports = router;
