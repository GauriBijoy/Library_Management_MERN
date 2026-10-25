require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// ======================================
// IMPORT ROUTES
// ======================================

const bookRoutes = require("./routes/bookRoutes");
const studentRoutes = require("./routes/studentRoutes");
const issueRoutes = require("./routes/issueRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ======================================
// CREATE EXPRESS APPLICATION
// ======================================

const app = express();

// ======================================
// CORS CONFIGURATION
// ======================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "http://localhost:5178",

  // Vercel frontend URLs
  "https://library-management-mern-phi.vercel.app",
  "https://library-management-mern-hyqcb52vb-gauribijoy.vercel.app",

  // Additional frontend URL from environment variables
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());

// ======================================
// PUBLIC DEMO PROTECTION
// ======================================

// When DEMO_MODE=true, visitors can view library
// information but cannot add, edit, or delete records.

app.use("/api", (req, res, next) => {
  if (
    process.env.DEMO_MODE === "true" &&
    req.method !== "GET"
  ) {
    return res.status(403).json({
      message: "Public demo is read-only.",
    });
  }

  next();
});

// ======================================
// API ROUTES
// ======================================

// Books API
app.use("/api/books", bookRoutes);

// Students API
app.use("/api/students", studentRoutes);

// Issue and Return Books API
app.use("/api/issues", issueRoutes);

// Dashboard API
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
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Library Management API is ready");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();