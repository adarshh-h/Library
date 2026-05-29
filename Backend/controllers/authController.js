const User      = require("../models/User");
const bcrypt    = require("bcryptjs");
const jwt       = require("jsonwebtoken");
const nodemailer= require("nodemailer");

// ─── In-memory OTP store ──────────────────────────────────────────────────────
// Fine for single-instance. Replace with Redis for multi-instance / production.
const otpStorage = new Map();

// Auto-clean expired OTPs every 15 min to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStorage.entries()) {
    if (now > record.expiresAt) otpStorage.delete(email);
  }
}, 15 * 60 * 1000);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });

const setTokenCookie = (res, token) =>
  res.cookie("token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge:   8 * 3600 * 1000, // 8 hours — matches JWT expiry
    path:     "/",
  });

const clearTokenCookie = (res) =>
  res.cookie("token", "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires:  new Date(0),
    path:     "/",
  });

const safeUserResponse = (user) => ({
  id: user._id, name: user.name, email: user.email, role: user.role,
});

// ─── Forgot Password ─────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  // Always return same message to prevent user enumeration
  const GENERIC = { message: "If that email is registered, an OTP has been sent." };

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(200).json(GENERIC);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(email, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      to:      user.email,
      from:    `"HNBGU Library" <${process.env.EMAIL_USER}>`,
      subject: "Password Reset OTP – HNBGU Library",
      html: `<p>Hello <b>${user.name}</b>,</p>
             <p>Your OTP for password reset is: <b style="font-size:1.4em;letter-spacing:4px">${otp}</b></p>
             <p>This OTP expires in <b>10 minutes</b>. Do not share it with anyone.</p>
             <p style="color:#888;font-size:12px">HNBGU Central Library</p>`,
    });

    res.status(200).json(GENERIC);
  } catch (error) {
    console.error("[Auth] forgotPassword:", error.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ─── Verify OTP & Reset Password ─────────────────────────────────────────────
exports.verifyOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "Email, OTP, and new password are required." });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "New password must be at least 6 characters." });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const record = otpStorage.get(email);
    if (!record || record.otp !== String(otp).trim() || Date.now() > record.expiresAt)
      return res.status(400).json({ message: "Invalid or expired OTP." });

    otpStorage.delete(email); // consume OTP — one-time use

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful. Please log in." });
  } catch (error) {
    console.error("[Auth] verifyOtp:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Shared login logic ───────────────────────────────────────────────────────
const loginHandler = (role) => async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase().trim(), role }).select("+password");
    if (!user)
      return res.status(401).json({ message: "Invalid email or password.", code: "INVALID_CREDENTIALS" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password.", code: "INVALID_CREDENTIALS" });

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.json({ success: true, message: "Login successful.", user: safeUserResponse(user) });
  } catch (error) {
    console.error(`[Auth] ${role}Login:`, error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.librarianLogin = loginHandler("librarian");
exports.studentLogin   = loginHandler("student");

// ─── Logout ───────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out successfully." });
};

// ─── Check Session ────────────────────────────────────────────────────────────
exports.checkSession = async (req, res) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token)
    return res.status(401).json({ success: false, message: "No active session.", code: "NO_TOKEN" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password").lean();
    if (!user)
      return res.status(401).json({ success: false, message: "User not found.", code: "USER_NOT_FOUND" });

    res.json({ success: true, user: safeUserResponse(user) });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.name === "TokenExpiredError" ? "Session expired." : "Invalid session.",
      code:    err.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN",
    });
  }
};

// ─── Change Password (legacy — kept for authRoutes compatibility) ─────────────
exports.changePassword = require("./profileController").changePassword;
