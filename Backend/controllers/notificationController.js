const Issue = require("../models/Issue");
const { sendDueDateReminder } = require("../services/emailService");

const checkDueDatesAndNotify = async () => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch issues with books due tomorrow or earlier (to be safe)
    const issues = await Issue.find({
      "books.dueDate": { $gte: tomorrow, $lt: dayAfterTomorrow }
    })
      .populate("books.book", "bookName authorName")
      .populate("student", "name email")
      .populate("returnedBooks.book", "_id issuedBookId");

    for (const issue of issues) {
      const student = issue.student;
      const returnedSet = new Set(issue.returnedBooks.map(r => r.issuedBookId?.toString()));
      const booksToNotify = [];

      for (const bookEntry of issue.books) {
        const issuedId = bookEntry._id.toString();
        const dueDate = new Date(bookEntry.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        if (!returnedSet.has(issuedId) && dueDate.getTime() === tomorrow.getTime()) {
          booksToNotify.push({
            bookName: bookEntry.book.bookName,
            authorName: bookEntry.book.authorName,
            dueDate: bookEntry.dueDate
          });
        }
      }

      if (booksToNotify.length > 0) {
        await sendDueDateReminder(student, booksToNotify);
        console.log(`✅ Reminder sent to ${student.email} for ${booksToNotify.length} due books.`);
      }
    }

    console.log("📬 Due date notification task completed.");
  } catch (error) {
    console.error("❌ Error in checkDueDatesAndNotify:", error.message || error);
  }
};

module.exports = { checkDueDatesAndNotify };
