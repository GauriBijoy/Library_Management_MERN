const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Student = require("../models/Student");

// ===================================
// 1. ADD STUDENT
// ===================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      admissionNumber,
      className,
      division,
      email,
      phone,
    } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !admissionNumber?.trim() ||
      !className?.trim() ||
      !division?.trim()
    ) {
      return res.status(400).json({
        message: "Name, admission number, class and division are required",
      });
    }

    // Check duplicate admission number
    const existingStudent = await Student.findOne({
      admissionNumber: admissionNumber.trim(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with this admission number already exists",
      });
    }

    // Create student
    const newStudent = new Student({
      name,
      admissionNumber,
      className,
      division,
      email,
      phone,
    });

    const savedStudent = await newStudent.save();

    res.status(201).json({
      message: "Student added successfully",
      student: savedStudent,
    });

  } catch (error) {
    console.error("Add Student Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Admission number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to add student",
    });
  }
});

// ===================================
// 2. GET ALL STUDENTS
// ===================================

router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    res.status(200).json(students);

  } catch (error) {
    console.error("Fetch Students Error:", error);

    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

// ===================================
// 3. UPDATE STUDENT
// ===================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const {
      name,
      admissionNumber,
      className,
      division,
      email,
      phone,
    } = req.body;

    if (
      !name?.trim() ||
      !admissionNumber?.trim() ||
      !className?.trim() ||
      !division?.trim()
    ) {
      return res.status(400).json({
        message: "Name, admission number, class and division are required",
      });
    }

    const existingStudent = await Student.findById(id);

    if (!existingStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    // Check duplicate admission number
    const duplicateStudent = await Student.findOne({
      admissionNumber: admissionNumber.trim(),
      _id: { $ne: id },
    });

    if (duplicateStudent) {
      return res.status(400).json({
        message: "Another student uses this admission number",
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        admissionNumber,
        className,
        division,
        email,
        phone,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Student updated successfully",
      student: updatedStudent,
    });

  } catch (error) {
    console.error("Update Student Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Admission number already exists",
      });
    }

    res.status(500).json({
      message: "Failed to update student",
    });
  }
});

// ===================================
// 4. DELETE STUDENT
// ===================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid student ID",
      });
    }

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Student deleted successfully",
    });

  } catch (error) {
    console.error("Delete Student Error:", error);

    res.status(500).json({
      message: "Failed to delete student",
    });
  }
});

module.exports = router;