const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect(role)
 * Accepts token from httpOnly cookie OR Authorization: Bearer <token> header.
 * Attaches the full user document (no password) to req.user.
 * Role is optional — omit to allow any authenticated user.
 */
const protect = (role) => async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized. Please log in.", code: "NO_TOKEN" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res.status(401).json({ success: false, message: "Account no longer exists.", code: "USER_NOT_FOUND" });
    }
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires '${role}' role.`,
        code: "FORBIDDEN",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Please log in again.", code: "TOKEN_EXPIRED" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token.", code: "INVALID_TOKEN" });
    }
    console.error("[Auth] Unexpected error:", err.message);
    return res.status(500).json({ success: false, message: "Authentication error." });
  }
};

module.exports = { protect };
