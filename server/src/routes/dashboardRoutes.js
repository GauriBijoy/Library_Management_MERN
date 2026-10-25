const express = require("express");
const router = express.Router();

const Book = require("../models/Book");
const Student = require("../models/Student");
const Issue = require("../models/Issue");

// ======================================
// GET DASHBOARD STATISTICS
// ======================================

router.get("/", async (req, res) => {
  try {
    const now = new Date();

    const [
      totalBooks,
      totalStudents,
      currentlyIssued,
      returnedBooks,
      overdueBooks,
      availableCopiesResult,
    ] = await Promise.all([
      Book.countDocuments(),

      Student.countDocuments(),

      Issue.countDocuments({
        status: "Issued",
      }),

      Issue.countDocuments({
        status: "Returned",
      }),

      Issue.countDocuments({
        status: "Issued",
        dueDate: { $lt: now },
      }),

      Book.aggregate([
        {
          $group: {
            _id: null,
            total: {
              $sum: "$quantity",
            },
          },
        },
      ]),
    ]);

    const availableCopies =
      availableCopiesResult.length > 0
        ? availableCopiesResult[0].total
        : 0;

    return res.status(200).json({
      totalBooks,
      availableCopies,
      totalStudents,
      currentlyIssued,
      returnedBooks,
      overdueBooks,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
});

module.exports = router;