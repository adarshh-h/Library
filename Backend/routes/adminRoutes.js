const express = require("express");
const multer  = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  createStudent, getStudents, getStudentById,
  updateStudent, deleteStudent, bulkImportStudents,
} = require("../controllers/studentController");
const { createLibrarian, resetStudentPassword } = require("../controllers/librarianController");
const { getProfile, updateProfile, changePassword } = require("../controllers/profileController");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile",         protect("librarian"), getProfile);
router.put("/profile",         protect("librarian"), updateProfile);
router.post("/change-password",protect("librarian"), changePassword);

// ── Librarian management ─────────────────────────────────────────────────────
router.post("/create-librarian", protect("librarian"), createLibrarian);

// ── Student management ───────────────────────────────────────────────────────
router.post("/create-student",                        protect("librarian"), createStudent);
router.get("/students",                               protect("librarian"), getStudents);
router.get("/students/:id",                           protect("librarian"), getStudentById);
router.put("/students/:id",                           protect("librarian"), updateStudent);
router.delete("/students/:id",                        protect("librarian"), deleteStudent);
router.post("/students/:id/reset-password",           protect("librarian"), resetStudentPassword);
router.post("/bulk-import-students", protect("librarian"), upload.single("file"), bulkImportStudents);

module.exports = router;
