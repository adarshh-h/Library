const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone:      { type: String, required: true, trim: true },
    password:   { type: String, required: true, select: false },
    role:       { type: String, enum: ["librarian", "student"], required: true },
    department: { type: String, required: true, trim: true },
    batch:      { type: String, default: null },
    rollNumber: { type: String, default: null, unique: true, sparse: true, uppercase: true, trim: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Enforce librarian fields
UserSchema.pre("save", function (next) {
  if (this.role === "librarian") {
    this.batch      = undefined;
    this.rollNumber = undefined;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
