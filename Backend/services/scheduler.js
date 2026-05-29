const cron = require("node-cron");
const { checkDueDatesAndNotify } = require("../controllers/notificationController");

const setupScheduledJobs = () => {
  // Runs every day at 9:00 AM — sends due-date reminder emails
  cron.schedule("0 9 * * *", () => {
    console.log(`[CRON] ${new Date().toLocaleString()} — Running due date check...`);
    checkDueDatesAndNotify();
  });
};

module.exports = { setupScheduledJobs };
