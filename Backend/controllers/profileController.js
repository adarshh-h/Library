const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ─── GET profile (librarian & student share same logic) ──────────────────────

exports.getProfile = async (req, res) => {
  try {
    // req.user is already set by protect() — no extra DB call needed
    const { _id, name, email, phone, department, batch, rollNumber, role } = req.user;
    res.json({
      success: true,
      user: { _id, name, email, phone, department, batch, rollNumber, role },
    });
  } catch (err) {
    console.error("[Profile] getProfile:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
};

// ─── PUT profile ─────────────────────────────────────────────────────────────

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, batch } = req.body;
    const updates = {};

    if (name) {
      if (!/^[A-Za-z\s'-]+$/.test(name))
        return res.status(400).json({ success: false, message: "Name contains invalid characters." });
      updates.name = name.trim();
    }
    if (phone) {
      if (!/^\d{10}$/.test(phone))
        return res.status(400).json({ success: false, message: "Phone must be exactly 10 digits." });
      updates.phone = phone.trim();
    }
    if (department) {
      if (!/^[A-Za-z\s&]+$/.test(department))
        return res.status(400).json({ success: false, message: "Department contains invalid characters." });
      updates.department = department.trim();
    }
    // batch is student-only — silently ignore for librarians
    if (batch && req.user.role === "student") {
      if (!/^\d{4}-\d{4}$/.test(batch))
        return res.status(400).json({ success: false, message: "Batch must be in YYYY-YYYY format." });
      updates.batch = batch.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields provided." });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({ success: true, message: "Profile updated successfully.", user });
  } catch (err) {
    console.error("[Profile] updateProfile:", err.message);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// ─── POST change-password ─────────────────────────────────────────────────────

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({ success: false, message: "New password must differ from current password." });
    }

    user.password = newPassword; // pre-save hook hashes it
    await user.save();

    // Clear cookie so user must log in again with new password
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({ success: true, message: "Password changed. Please log in again." });
  } catch (err) {
    console.error("[Profile] changePassword:", err.message);
    res.status(500).json({ success: false, message: "Failed to change password." });
  }
};
