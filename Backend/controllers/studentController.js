const User  = require("../models/User");
const Issue = require("../models/Issue");
const csv   = require("csv-parser");
const fs    = require("fs");

// ─── Shared validators ────────────────────────────────────────────────────────
const VALIDATORS = {
  name:       (v) => /^[A-Za-z\s'-]+$/.test(v?.trim()),
  email:      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim()),
  phone:      (v) => /^\d{10}$/.test(v?.trim()),
  department: (v) => /^[A-Za-z\s&]+$/.test(v?.trim()),
  batch:      (v) => /^\d{4}-\d{4}$/.test(v?.trim()),
  rollNumber: (v) => /^[A-Za-z0-9]+$/.test(v?.trim()),
};

const defaultPassword = (name) => {
  const first = name.trim().split(" ")[0];
  return `${first.substring(0, 2)}@123`;
};

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

// ─── POST /api/admin/create-student ──────────────────────────────────────────
exports.createStudent = async (req, res) => {
  try {
    const { name, email, phone, department, batch, rollNumber } = req.body;

    // Validate all required fields
    const fieldErrors = [
      !name       && "Name is required.",
      !email      && "Email is required.",
      !phone      && "Phone is required.",
      !department && "Department is required.",
      !batch      && "Batch is required.",
      !rollNumber && "Roll number is required.",
      name       && !VALIDATORS.name(name)       && "Name contains invalid characters.",
      email      && !VALIDATORS.email(email)     && "Invalid email address.",
      phone      && !VALIDATORS.phone(phone)     && "Phone must be exactly 10 digits.",
      department && !VALIDATORS.department(department) && "Department contains invalid characters.",
      batch      && !VALIDATORS.batch(batch)     && "Batch must be YYYY-YYYY format.",
      rollNumber && !VALIDATORS.rollNumber(rollNumber) && "Roll number must be alphanumeric.",
    ].filter(Boolean);

    if (fieldErrors.length)
      return res.status(400).json({ success: false, message: fieldErrors[0] });

    const conflict = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { rollNumber: rollNumber.toUpperCase() }],
    }).lean();
    if (conflict) {
      const field = conflict.email === email.toLowerCase() ? "email" : "roll number";
      return res.status(409).json({ success: false, message: `A student with this ${field} already exists.` });
    }

    const password = defaultPassword(name);
    const student  = await new User({
      name:       name.trim(),
      email:      email.trim().toLowerCase(),
      phone:      phone.trim(),
      password,
      department: department.trim(),
      batch:      batch.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      role:       "student",
      createdBy:  req.user._id,
    }).save();

    res.status(201).json({
      success: true,
      message: "Student account created successfully.",
      student: {
        _id: student._id, name: student.name, email: student.email,
        department: student.department, batch: student.batch, rollNumber: student.rollNumber,
      },
      temporaryPassword: password,
    });
  } catch (err) {
    console.error("[Student] createStudent:", err.message);
    res.status(500).json({ success: false, message: "Failed to create student." });
  }
};

// ─── GET /api/admin/students ──────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  try {
    const page   = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit  = Math.min(parseInt(req.query.limit) || 10, 100);
    const search = req.query.search?.trim() || "";
    const skip   = (page - 1) * limit;

    const filter = {
      role: "student",
      ...(search && {
        $or: [
          { name:       { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
          { batch:      { $regex: search, $options: "i" } },
          { department: { $regex: search, $options: "i" } },
          { email:      { $regex: search, $options: "i" } },
        ],
      }),
    };

    const [students, total] = await Promise.all([
      User.find(filter).select("-password").skip(skip).limit(limit).sort({ name: 1 }).lean(),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      students,
      pagination: { total, totalPages: Math.ceil(total / limit), currentPage: page, limit },
    });
  } catch (err) {
    console.error("[Student] getStudents:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch students." });
  }
};

// ─── GET /api/admin/students/:id ─────────────────────────────────────────────
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student ID." });

    const student = await User.findOne({ _id: id, role: "student" }).select("-password").lean();
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found." });

    res.json({ success: true, student });
  } catch (err) {
    console.error("[Student] getStudentById:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch student." });
  }
};

// ─── PUT /api/admin/students/:id ─────────────────────────────────────────────
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student ID." });

    const { name, email, phone, department, batch, rollNumber } = req.body;

    // Validate provided fields
    if (name       && !VALIDATORS.name(name))             return res.status(400).json({ success: false, message: "Name contains invalid characters." });
    if (email      && !VALIDATORS.email(email))           return res.status(400).json({ success: false, message: "Invalid email address." });
    if (phone      && !VALIDATORS.phone(phone))           return res.status(400).json({ success: false, message: "Phone must be 10 digits." });
    if (batch      && !VALIDATORS.batch(batch))           return res.status(400).json({ success: false, message: "Batch must be YYYY-YYYY." });
    if (rollNumber && !VALIDATORS.rollNumber(rollNumber)) return res.status(400).json({ success: false, message: "Roll number must be alphanumeric." });

    // Uniqueness check — exclude current student
    if (email || rollNumber) {
      const conflict = await User.findOne({
        _id: { $ne: id },
        $or: [
          ...(email      ? [{ email: email.toLowerCase() }]      : []),
          ...(rollNumber ? [{ rollNumber: rollNumber.toUpperCase() }] : []),
        ],
      }).lean();
      if (conflict) {
        const field = conflict.email === email?.toLowerCase() ? "email" : "roll number";
        return res.status(409).json({ success: false, message: `This ${field} is already in use.` });
      }
    }

    const updates = {};
    if (name)       updates.name       = name.trim();
    if (email)      updates.email      = email.trim().toLowerCase();
    if (phone)      updates.phone      = phone.trim();
    if (department) updates.department = department.trim();
    if (batch)      updates.batch      = batch.trim();
    if (rollNumber) updates.rollNumber = rollNumber.trim().toUpperCase();

    if (!Object.keys(updates).length)
      return res.status(400).json({ success: false, message: "No valid fields to update." });

    const student = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .select("-password").lean();
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found." });

    res.json({ success: true, message: "Student updated.", student });
  } catch (err) {
    console.error("[Student] updateStudent:", err.message);
    res.status(500).json({ success: false, message: "Failed to update student." });
  }
};

// ─── DELETE /api/admin/students/:id ──────────────────────────────────────────
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid student ID." });

    const student = await User.findOneAndDelete({ _id: id, role: "student" });
    if (!student)
      return res.status(404).json({ success: false, message: "Student not found." });

    // Cascade: remove all issue records for this student
    const deleted = await Issue.deleteMany({ student: id });
    console.log(`[Student] Deleted student ${id}, removed ${deleted.deletedCount} issue record(s).`);

    res.json({ success: true, message: "Student and their issue records deleted." });
  } catch (err) {
    console.error("[Student] deleteStudent:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete student." });
  }
};

// ─── POST /api/admin/bulk-import-students ─────────────────────────────────────
exports.bulkImportStudents = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "No file uploaded." });

  const valid = [], errors = [], duplicates = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (row) => {
          const r = {
            name:       row.name?.trim(),
            email:      row.email?.trim().toLowerCase(),
            phone:      row.phone?.trim(),
            department: row.department?.trim(),
            batch:      row.batch?.trim(),
            rollNumber: row.rollNumber?.trim(),
          };

          const missing = Object.entries(r).filter(([, v]) => !v).map(([k]) => k);
          if (missing.length) { errors.push({ row: r, error: `Missing: ${missing.join(", ")}` }); return; }

          if (!VALIDATORS.email(r.email))      { errors.push({ row: r, error: "Invalid email." });           return; }
          if (!VALIDATORS.phone(r.phone))      { errors.push({ row: r, error: "Phone must be 10 digits." }); return; }
          if (!VALIDATORS.batch(r.batch))      { errors.push({ row: r, error: "Batch must be YYYY-YYYY." }); return; }
          if (!VALIDATORS.rollNumber(r.rollNumber)) { errors.push({ row: r, error: "Roll number must be alphanumeric." }); return; }

          r.rollNumber = r.rollNumber.toUpperCase();
          valid.push({ ...r, password: defaultPassword(r.name), role: "student", createdBy: req.user._id });
        })
        .on("end",   resolve)
        .on("error", reject);
    });

    if (!valid.length) {
      return res.status(422).json({ success: false, message: "No valid records in CSV.", errors });
    }

    // Deduplicate within CSV
    const seenEmails = new Set(), seenRolls = new Set();
    const deduped = valid.filter((s) => {
      if (seenEmails.has(s.email) || seenRolls.has(s.rollNumber)) {
        duplicates.push({ rollNumber: s.rollNumber, error: "Duplicate within CSV." });
        return false;
      }
      seenEmails.add(s.email); seenRolls.add(s.rollNumber);
      return true;
    });

    // Check DB
    const existing = await User.find({
      $or: [
        { email:      { $in: deduped.map((s) => s.email) } },
        { rollNumber: { $in: deduped.map((s) => s.rollNumber) } },
      ],
    }).select("email rollNumber").lean();

    const existEmails = new Set(existing.map((e) => e.email));
    const existRolls  = new Set(existing.map((e) => e.rollNumber));

    const toSave = deduped.filter((s) => {
      if (existEmails.has(s.email))      { duplicates.push({ rollNumber: s.rollNumber, error: "Email already exists." });      return false; }
      if (existRolls.has(s.rollNumber))  { duplicates.push({ rollNumber: s.rollNumber, error: "Roll number already exists." }); return false; }
      return true;
    });

    let created = 0;
    for (const s of toSave) {
      try { await new User(s).save(); created++; }
      catch (e) {
        if (e.code === 11000) duplicates.push({ rollNumber: s.rollNumber, error: "DB duplicate key." });
        else                  errors.push({ row: s, error: e.message });
      }
    }

    res.status(201).json({
      success: true,
      message: "Bulk import complete.",
      summary: { created, duplicates: duplicates.length, errors: errors.length },
      duplicates,
      errors,
    });
  } catch (err) {
    console.error("[Student] bulkImport:", err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: "Error processing CSV." });
  } finally {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
  }
};
