const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Issue = require("../models/Issue");
const Book = require("../models/Book");
const Student = require("../models/Student");

// ===================================
// 1. ISSUE A BOOK
// ===================================

router.post("/", async (req, res) => {
  let session;

  try {
    const { studentId, bookId, issueDate, dueDate } = req.body;

    // Validate required fields
    if (!studentId || !bookId || !issueDate || !dueDate) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Validate MongoDB IDs
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(bookId)
    ) {
      return res.status(400).json({
        message: "Invalid student or book ID",
      });
    }

    // Validate dates
    const issuedOn = new Date(issueDate);
    const dueOn = new Date(dueDate);

    if (
      Number.isNaN(issuedOn.getTime()) ||
      Number.isNaN(dueOn.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid issue date or due date",
      });
    }

    if (dueOn < issuedOn) {
      return res.status(400).json({
        message: "Due date cannot be before issue date",
      });
    }

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Check student exists
    const student = await Student.findById(studentId).session(
      session
    );

    if (!student) {
      await session.abortTransaction();

      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Reduce available quantity by one
    const updatedBook = await Book.findOneAndUpdate(
      {
        _id: bookId,
        quantity: { $gt: 0 },
      },
      {
        $inc: { quantity: -1 },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedBook) {
      await session.abortTransaction();

      return res.status(400).json({
        message: "Book not found or no copies available",
      });
    }

    // Create issue record
    const createdIssues = await Issue.create(
      [
        {
          student: studentId,
          book: bookId,
          issueDate: issuedOn,
          dueDate: dueOn,
          status: "Issued",
          returnDate: null,
        },
      ],
      { session }
    );

    // Save changes together
    await session.commitTransaction();

    return res.status(201).json({
      message: "Book issued successfully",
      issue: createdIssues[0],
    });
  } catch (error) {
    console.error("Issue Book Error:", error);

    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: "Failed to issue book",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

// ===================================
// 2. GET ALL ISSUE RECORDS
// ===================================

router.get("/", async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate(
        "student",
        "name admissionNumber className division"
      )
      .populate(
        "book",
        "title author isbn category"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(issues);
  } catch (error) {
    console.error("Fetch Issues Error:", error);

    return res.status(500).json({
      message: "Failed to fetch issued books",
    });
  }
});

// ===================================
// 3. RETURN A BOOK
// ===================================

router.put("/:id/return", async (req, res) => {
  let session;

  try {
    const { id } = req.params;

    // Validate issue ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid issue ID",
      });
    }

    // Start transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Mark the issue as returned only if still issued
    const returnedIssue = await Issue.findOneAndUpdate(
      {
        _id: id,
        status: "Issued",
      },
      {
        $set: {
          status: "Returned",
          returnDate: new Date(),
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!returnedIssue) {
      const existingIssue = await Issue.findById(id).session(
        session
      );

      await session.abortTransaction();

      if (!existingIssue) {
        return res.status(404).json({
          message: "Issue record not found",
        });
      }

      return res.status(400).json({
        message: "This book has already been returned",
      });
    }

    // Restore one available copy
    const updatedBook = await Book.findByIdAndUpdate(
      returnedIssue.book,
      {
        $inc: {
          quantity: 1,
        },
      },
      {
        new: true,
        session,
      }
    );

    if (!updatedBook) {
      await session.abortTransaction();

      return res.status(404).json({
        message:
          "Book not found. Return could not be completed",
      });
    }

    // Commit both updates together
    await session.commitTransaction();

    return res.status(200).json({
      message: "Book returned successfully",
      issue: returnedIssue,
      availableQuantity: updatedBook.quantity,
    });
  } catch (error) {
    console.error("Return Book Error:", error);

    if (session?.inTransaction()) {
      await session.abortTransaction();
    }

    return res.status(500).json({
      message: "Failed to return book",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
});

module.exports = router;