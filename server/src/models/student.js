const mongoose = require("mongoose");

// ===================================
// STUDENT SCHEMA
// ===================================

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    admissionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    className: {
      type: String,
      required: true,
      trim: true,
    },

    division: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ===================================
// EXPORT STUDENT MODEL
// ===================================

module.exports = mongoose.model("Student", studentSchema);