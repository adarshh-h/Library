const express = require("express");
const router = express.Router();
const { getIssueReturnHistory } = require("../controllers/historyController");
const { protect } = require("../middleware/authMiddleware");

router.get("/history/:studentId", protect("librarian"), getIssueReturnHistory);

module.exports = router;