require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// Import routes
const bookRoutes = require("./routes/bookRoutes");
const studentRoutes = require("./routes/studentRoutes");
const issueRoutes = require("./routes/issueRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// ======================================
// MIDDLEWARE
// ======================================

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
    ],
  })
);

app.use(express.json());

// ======================================
// API ROUTES
// ======================================

app.use("/api/books", bookRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ======================================
// TEST ROUTE
// ======================================

app.get("/", (req, res) => {
  res.send("Library Management API is running");
});

// ======================================
// START SERVER
// ======================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();