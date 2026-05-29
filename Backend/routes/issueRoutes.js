const express = require("express");
const router = express.Router();
const {
  getBookDetails,
  getStudentDetails,
  issueBooksToStudent
} = require("../controllers/issueController");
const { protect } = require("../middleware/authMiddleware");

// Get book details by accession number
router.get("/book/:accessionNumber", protect("librarian"), getBookDetails);

// Get student details by roll number
router.get("/student-by-roll/:rollNumber", protect("librarian"), getStudentDetails);

// Issue books to a student
router.post("/issue", protect("librarian"), issueBooksToStudent);

module.exports = router;