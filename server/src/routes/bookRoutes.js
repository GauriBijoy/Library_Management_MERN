const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Book = require("../models/Book");

// ===================================
// 1. ADD NEW BOOK
// ===================================

router.post("/", async (req, res) => {
  try {
    const { title, author, isbn, category, quantity } = req.body;

    // Validate required fields
    if (
      !title ||
      !author ||
      !isbn ||
      !category ||
      quantity === undefined ||
      quantity === null ||
      quantity === ""
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Validate quantity
    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        message: "Quantity must be a non-negative whole number",
      });
    }

    // Check duplicate ISBN
    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      return res.status(400).json({
        message: "A book with this ISBN already exists",
      });
    }

    // Create new book
    const newBook = new Book({
      title,
      author,
      isbn,
      category,
      quantity: Number(quantity),
    });

    // Save book to MongoDB
    const savedBook = await newBook.save();

    res.status(201).json({
      message: "Book added successfully",
      book: savedBook,
    });

  } catch (error) {
    console.error("Add Book Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "A book with this ISBN already exists",
      });
    }

    res.status(500).json({
      message: "Failed to add book",
    });
  }
});

// ===================================
// 2. GET ALL BOOKS
// ===================================

router.get("/", async (req, res) => {
  try {
    console.log("Fetching books from MongoDB...");

    const books = await Book.find().sort({
      createdAt: -1,
    });

    console.log("Books fetched:", books.length);

    res.status(200).json(books);

  } catch (error) {
    console.error("FETCH BOOKS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch books",
    });
  }
});

// ===================================
// 3. UPDATE / EDIT BOOK
// ===================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    const { title, author, isbn, category, quantity } = req.body;

    // Validate required fields
    if (
      !title ||
      !author ||
      !isbn ||
      !category ||
      quantity === undefined ||
      quantity === null ||
      quantity === ""
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Validate quantity
    if (
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 0
    ) {
      return res.status(400).json({
        message: "Quantity must be a non-negative whole number",
      });
    }

    // Check whether the book exists
    const existingBook = await Book.findById(id);

    if (!existingBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Prevent duplicate ISBN numbers
    const duplicateBook = await Book.findOne({
      isbn,
      _id: { $ne: id },
    });

    if (duplicateBook) {
      return res.status(400).json({
        message: "Another book already uses this ISBN",
      });
    }

    // Update book in MongoDB
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        title,
        author,
        isbn,
        category,
        quantity: Number(quantity),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Book updated successfully",
      book: updatedBook,
    });

  } catch (error) {
    console.error("Update Book Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Another book already uses this ISBN",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to update book",
    });
  }
});

// ===================================
// 4. DELETE BOOK
// ===================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid book ID",
      });
    }

    // Delete book from MongoDB
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.status(200).json({
      message: "Book deleted successfully",
    });

  } catch (error) {
    console.error("Delete Book Error:", error);

    res.status(500).json({
      message: "Failed to delete book",
    });
  }
});

module.exports = router;