const User = require("../models/User");

// ─── POST /api/admin/create-librarian ───────────────────────────────────────

exports.createLibrarian = async (req, res) => {
  try {
    const { name, email, phone, password, department } = req.body;

    // Validate
    if (!name || !email || !phone || !password || !department) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (!/^[A-Za-z\s'-]+$/.test(name)) {
      return res.status(400).json({ success: false, message: "Name contains invalid characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address." });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: "Phone must be 10 digits." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "A user with this email already exists." });
    }

    const librarian = await new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password,
      department: department.trim(),
      role: "librarian",
      createdBy: req.user._id,
    }).save();

    res.status(201).json({
      success: true,
      message: "Librarian account created successfully.",
      librarian: {
        _id: librarian._id,
        name: librarian.name,
        email: librarian.email,
        phone: librarian.phone,
        department: librarian.department,
        role: librarian.role,
      },
    });
  } catch (err) {
    console.error("[Librarian] createLibrarian:", err.message);
    res.status(500).json({ success: false, message: "Failed to create librarian." });
  }
};

// ─── POST /api/admin/students/:id/reset-password ────────────────────────────

exports.resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID." });
    }

    const student = await User.findOne({ _id: id, role: "student" }).select("+password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    // Generate a new default password from student's name
    const firstName  = student.name.trim().split(" ")[0];
    const newPassword = `${firstName.substring(0, 2)}@123`;

    student.password = newPassword; // pre-save hook will hash it
    await student.save();

    res.json({
      success: true,
      message: `Password reset for ${student.name}.`,
      temporaryPassword: newPassword, // shown once to the librarian
    });
  } catch (err) {
    console.error("[Librarian] resetStudentPassword:", err.message);
    res.status(500).json({ success: false, message: "Failed to reset password." });
  }
};
