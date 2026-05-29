const nodemailer = require("nodemailer");

// Lazy-create transporter so missing EMAIL_USER/PASS doesn't crash startup
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }
  return _transporter;
};

const BRAND_GREEN = "#1a5a1a";
const BRAND_GOLD  = "#b8860b";

const baseLayout = (headerColor, headerTitle, body) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);max-width:600px;width:100%">
        <!-- Header -->
        <tr><td style="background:${headerColor};padding:28px 32px;text-align:center">
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:2px;text-transform:uppercase">HNBGU Central Library</p>
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:600">${headerTitle}</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 32px">${body}</td></tr>
        <!-- Footer -->
        <tr><td style="background:#f4f7f4;padding:16px 32px;text-align:center;border-top:1px solid #e8f0e8">
          <p style="margin:0;color:#888;font-size:12px">Hemwati Nandan Bahuguna Garhwal University · Central Library</p>
          <p style="margin:4px 0 0;color:#aaa;font-size:11px">© ${new Date().getFullYear()} HNBGU. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const bookTable = (books, extraCol) => `
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;font-size:14px">
  <thead>
    <tr style="background:#f0f9f0">
      <th style="padding:10px 12px;text-align:left;border:1px solid #d4e8d4;color:#1a5a1a">Book Title</th>
      <th style="padding:10px 12px;text-align:left;border:1px solid #d4e8d4;color:#1a5a1a">Author</th>
      ${extraCol ? `<th style="padding:10px 12px;text-align:left;border:1px solid #d4e8d4;color:#1a5a1a">${extraCol.header}</th>` : ""}
    </tr>
  </thead>
  <tbody>
    ${books.map((b, i) => `
      <tr style="background:${i % 2 ? "#fafffe" : "#fff"}">
        <td style="padding:10px 12px;border:1px solid #e8f0e8">${b.bookName}</td>
        <td style="padding:10px 12px;border:1px solid #e8f0e8">${b.authorName}</td>
        ${extraCol ? `<td style="padding:10px 12px;border:1px solid #e8f0e8">${extraCol.value(b)}</td>` : ""}
      </tr>`).join("")}
  </tbody>
</table>`;

const sendEmail = async (options) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("[Email] EMAIL_USER/PASS not configured — skipping email.");
      return false;
    }
    await getTransporter().sendMail({
      from:    `"HNBGU Library" <${process.env.EMAIL_USER}>`,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
    });
    console.log(`[Email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (err) {
    console.error("[Email] Failed:", err.message);
    return false;
  }
};

// ─── Issue Confirmation ───────────────────────────────────────────────────────
exports.sendIssueConfirmation = (student, books, dueDate) => {
  const dueFmt = new Date(dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const body = `
    <p style="color:#333;font-size:15px">Dear <strong>${student.name}</strong>,</p>
    <p style="color:#555">The following book(s) have been issued to you from HNBGU Central Library:</p>
    ${bookTable(books, { header: "Due Date", value: () => dueFmt })}
    <div style="background:#fff8e1;border-left:4px solid ${BRAND_GOLD};padding:14px 16px;border-radius:4px;margin-top:16px">
      <p style="margin:0;color:#7a5200;font-size:14px">⚠ Please return by <strong>${dueFmt}</strong> to avoid any issues.</p>
    </div>
    <p style="color:#777;font-size:13px;margin-top:20px">Happy reading!</p>`;
  return sendEmail({
    to:      student.email,
    subject: `📚 Books Issued – Due ${dueFmt}`,
    html:    baseLayout(BRAND_GREEN, "Book Issuance Confirmation", body),
  });
};

// ─── Return Confirmation ──────────────────────────────────────────────────────
exports.sendReturnConfirmation = (student, books, { isLate } = {}) => {
  const body = `
    <p style="color:#333;font-size:15px">Dear <strong>${student.name}</strong>,</p>
    <p style="color:#555">Thank you for returning the following book(s) to HNBGU Central Library:</p>
    ${bookTable(books)}
    ${isLate ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:4px;margin-top:16px">
      <p style="margin:0;color:#991b1b;font-size:14px">⚠ This book was returned <strong>after the due date</strong>. Please return books on time in future.</p>
    </div>` : `<div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:14px 16px;border-radius:4px;margin-top:16px">
      <p style="margin:0;color:#14532d;font-size:14px">✅ Returned on time. Thank you!</p>
    </div>`}
    <p style="color:#777;font-size:13px;margin-top:20px">We appreciate you using our library services.</p>`;
  return sendEmail({
    to:      student.email,
    subject: `✅ Books Returned – HNBGU Library`,
    html:    baseLayout(isLate ? "#dc2626" : "#16a34a", "Book Return Confirmation", body),
  });
};

// ─── Due Date Reminder ────────────────────────────────────────────────────────
exports.sendDueDateReminder = (student, books) => {
  const body = `
    <p style="color:#333;font-size:15px">Dear <strong>${student.name}</strong>,</p>
    <p style="color:#555">This is a reminder that the following book(s) are due <strong>tomorrow</strong>:</p>
    ${bookTable(books, { header: "Due Date", value: (b) => new Date(b.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) })}
    <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 16px;border-radius:4px;margin-top:16px">
      <p style="margin:0;color:#991b1b;font-size:14px">⚠ Please return these books to the library by their due dates.</p>
    </div>
    <p style="color:#777;font-size:13px;margin-top:20px">Thank you for using HNBGU Library.</p>`;
  return sendEmail({
    to:      student.email,
    subject: `⏰ Reminder: ${books.length} Book(s) Due Tomorrow`,
    html:    baseLayout(BRAND_GOLD, "Due Date Reminder", body),
  });
};
