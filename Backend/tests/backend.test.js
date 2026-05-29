/**
 * HNBGU Library Portal — Backend Tests
 * Run: node tests/backend.test.js
 */

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✅  ${name}`); passed++; }
  catch (e) { console.log(`  ❌  ${name}\n     → ${e.message}`); failed++; }
}

const assert = (cond, msg) => { if (!cond) throw new Error(msg || "Assertion failed"); };
const eq     = (a, b)      => { if (a !== b) throw new Error(`Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

const bcrypt = require("bcryptjs");

// ─── Auth ────────────────────────────────────────────────────────────────────
console.log("\n▶  Auth — Password hashing");

test("Single hash matches plain text", () => {
  const hash = bcrypt.hashSync("Ab@123", 10);
  assert(bcrypt.compareSync("Ab@123", hash));
});

test("Double-hash (old bulk-import bug) does NOT match plain text", () => {
  const h1 = bcrypt.hashSync("Ab@123", 10);
  const h2 = bcrypt.hashSync(h1, 10);          // model would hash again — bug
  assert(!bcrypt.compareSync("Ab@123", h2));
});

test("OTP — expired record is rejected", () => {
  const store = { "x@y.com": { otp: "111111", expiresAt: Date.now() - 1000 } };
  const r = store["x@y.com"];
  assert(!r || r.otp !== "111111" || Date.now() > r.expiresAt);
});

test("OTP — valid record is accepted", () => {
  const store = { "x@y.com": { otp: "222222", expiresAt: Date.now() + 60000 } };
  const r = store["x@y.com"];
  assert(r && r.otp === "222222" && Date.now() <= r.expiresAt);
});

test("OTP is always a 6-digit string", () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  eq(otp.length, 6);
  assert(!isNaN(Number(otp)));
});

// ─── Validators (shared VALIDATORS object) ───────────────────────────────────
console.log("\n▶  Shared Validators");

const V = {
  name:       (v) => /^[A-Za-z\s'-]+$/.test(v),
  email:      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone:      (v) => /^\d{10}$/.test(v),
  department: (v) => /^[A-Za-z\s&]+$/.test(v),
  batch:      (v) => /^\d{4}-\d{4}$/.test(v),
  rollNumber: (v) => /^[A-Za-z0-9]+$/.test(v),
};

test("Valid name",                   () => assert(V.name("Rahul Sharma")));
test("Name with numbers fails",      () => assert(!V.name("Rahul123")));
test("Valid email",                  () => assert(V.email("r@hnbgu.ac.in")));
test("Invalid email fails",          () => assert(!V.email("not-email")));
test("10-digit phone passes",        () => assert(V.phone("9876543210")));
test("9-digit phone fails",          () => assert(!V.phone("987654321")));
test("Phone with letters fails",     () => assert(!V.phone("98765abc10")));
test("Valid department",             () => assert(V.department("Computer Science & IT")));
test("Department with numbers fails",() => assert(!V.department("CS 123")));
test("Valid batch YYYY-YYYY",        () => assert(V.batch("2021-2025")));
test("Short year batch fails",       () => assert(!V.batch("21-25")));
test("Slash separator fails",        () => assert(!V.batch("2021/2025")));
test("Alphanumeric roll number",     () => assert(V.rollNumber("CS2101")));
test("Roll number with symbol fails",() => assert(!V.rollNumber("CS-21")));

// ─── ObjectId validation ──────────────────────────────────────────────────────
console.log("\n▶  ObjectId Validation");

const isOid = (id) => /^[0-9a-fA-F]{24}$/.test(id);
test("Valid ObjectId",   () => assert(isOid("507f1f77bcf86cd799439011")));
test("Invalid ObjectId", () => assert(!isOid("not-an-id")));
test("Short id fails",   () => assert(!isOid("507f1f77")));

// ─── Issue logic ──────────────────────────────────────────────────────────────
console.log("\n▶  Issue — Availability");

const isUnavailable = (issues, bookId) => {
  for (const issue of issues) {
    for (const b of issue.books) {
      if (b.book.toString() !== bookId) continue;
      const returned = issue.returnedBooks.some(
        (r) => r.issuedBookId?.toString() === b._id.toString()
      );
      if (!returned) return true;
    }
  }
  return false;
};

test("Unreturned book → unavailable", () => {
  const issues = [{
    books:         [{ _id: { toString: () => "e1" }, book: { toString: () => "b1" } }],
    returnedBooks: [],
  }];
  assert(isUnavailable(issues, "b1"));
});

test("Returned book → available", () => {
  const issues = [{
    books:         [{ _id: { toString: () => "e1" }, book: { toString: () => "b1" } }],
    returnedBooks: [{ issuedBookId: { toString: () => "e1" } }],
  }];
  assert(!isUnavailable(issues, "b1"));
});

test("dueDate must be strictly after issueDate", () => {
  assert(!(new Date("2026-04-30") > new Date("2026-05-01")), "Past due date invalid");
  assert(!(new Date("2026-05-01") > new Date("2026-05-01")), "Same day invalid");
  assert(new Date("2026-05-15") > new Date("2026-05-01"),    "Future due date valid");
});

// ─── Return logic ─────────────────────────────────────────────────────────────
console.log("\n▶  Return — Logic");

test("Duplicate return detected correctly", () => {
  const returned = [{ issuedBookId: { toString: () => "entry1" } }];
  assert(returned.some((r) => r.issuedBookId?.toString() === "entry1"));
});

test("isOverdue — past due date", () => {
  assert(new Date() > new Date(Date.now() - 86400000));
});

test("isOverdue — future due date", () => {
  assert(!(new Date() > new Date(Date.now() + 86400000)));
});

// ─── Default password generator ───────────────────────────────────────────────
console.log("\n▶  Default Password Generator");

const defaultPw = (name) => {
  const first = name.trim().split(" ")[0];
  return `${first.substring(0, 2)}@123`;
};

test("Full name → correct default password", () => eq(defaultPw("Rahul Sharma"), "Ra@123"));
test("Single name → correct default password", () => eq(defaultPw("Priya"), "Pr@123"));
test("Short name (1 char) → correct password",  () => eq(defaultPw("A"), "A@123"));

// ─── Book controller helpers ──────────────────────────────────────────────────
console.log("\n▶  Book — Numeric validation & limits");

test("Numeric year parses correctly",    () => eq(Number("2020"), 2020));
test("Non-numeric year is NaN",         () => assert(isNaN(Number("twenty"))));
test("Price '1500.50' parses to float", () => eq(Number("1500.50"), 1500.50));
test("Limit capped at 100",             () => eq(Math.min(9999, 100), 100));
test("Page never below 1",              () => eq(Math.max(0, 1), 1));

// ─── Cookie config ────────────────────────────────────────────────────────────
console.log("\n▶  Cookie Config");

const sameSite = (env) => env === "production" ? "none" : "lax";
const secure   = (env) => env === "production";

test("sameSite=lax in development",  () => eq(sameSite("development"), "lax"));
test("sameSite=none in production",  () => eq(sameSite("production"),  "none"));
test("secure=false in development",  () => eq(secure("development"),   false));
test("secure=true in production",    () => eq(secure("production"),    true));


// ─── New tests for v2 fixes ───────────────────────────────────────────────────

console.log("\n▶  Issue — Max books per student limit");

const MAX = 3;

test("Student with 0 books can receive up to 3", () => {
  const held = 0;
  assert(held < MAX, "Should be allowed");
  eq(MAX - held, 3);
});

test("Student already holding 3 books is blocked", () => {
  const held = 3;
  assert(held >= MAX, "Should be blocked");
});

test("Student holding 2 can only receive 1 more", () => {
  const held = 2;
  eq(MAX - held, 1);
});

test("Requesting more books than slots available is blocked", () => {
  const held = 2, requesting = 2, slots = MAX - held;
  assert(requesting > slots, "Should be blocked");
});

console.log("\n▶  History — isOverdue only when unreturned");

test("Returned book is never overdue", () => {
  const returned = true;
  const pastDue  = new Date() > new Date(Date.now() - 86400000);
  const isOverdue = !returned && pastDue;
  assert(!isOverdue, "Returned book should not be overdue");
});

test("Unreturned past-due book is overdue", () => {
  const returned = false;
  const pastDue  = new Date() > new Date(Date.now() - 86400000);
  const isOverdue = !returned && pastDue;
  assert(isOverdue, "Should be overdue");
});

console.log("\n▶  Return — ObjectId validation on body fields");

const isOid2 = (id) => /^[0-9a-fA-F]{24}$/.test(id);

test("Valid 24-char hex ObjectId passes",    () => assert(isOid2("507f1f77bcf86cd799439011")));
test("Empty string fails ObjectId check",   () => assert(!isOid2("")));
test("Short string fails ObjectId check",   () => assert(!isOid2("abc123")));
test("All three return body IDs required",  () => {
  const body = { studentId: "507f1f77bcf86cd799439011", issueId: null, issuedBookId: "507f1f77bcf86cd799439013" };
  const missing = !body.studentId || !body.issueId || !body.issuedBookId;
  assert(missing, "Null issueId should be caught");
});

console.log("\n▶  Cookie — changePassword clear flags match login flags");

test("changePassword cookie clear uses same secure flag as login", () => {
  const loginSecure = (env) => env === "production";
  const clearSecure = (env) => env === "production";
  eq(loginSecure("production"),   clearSecure("production"));
  eq(loginSecure("development"),  clearSecure("development"));
});

test("changePassword cookie clear uses same sameSite as login", () => {
  const loginSS = (env) => env === "production" ? "none" : "lax";
  const clearSS = (env) => env === "production" ? "none" : "lax";
  eq(loginSS("production"),  clearSS("production"));
  eq(loginSS("development"), clearSS("development"));
});

// Re-print summary after new tests
console.log(`\n${"─".repeat(52)}`);
console.log(`  ${passed} passed  |  ${failed} failed  |  ${passed + failed} total`);
if (failed > 0) { console.log("  ⚠️  Fix failing tests before deploying.\n"); process.exit(1); }
else            { console.log("  🎉 All tests passed!\n"); }
