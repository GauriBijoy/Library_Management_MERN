const mongoose = require("mongoose");

// ===================================
// ISSUE BOOK SCHEMA
// ===================================

const issueSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Issued", "Returned"],
      default: "Issued",
    },
  },
  {
    timestamps: true,
  }
);

// ===================================
// EXPORT ISSUE MODEL
// ===================================

module.exports = mongoose.model("Issue", issueSchema);