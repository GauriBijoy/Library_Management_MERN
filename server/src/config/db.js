const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Failed!");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);

    if (error.reason?.servers) {
      for (const [server, details] of error.reason.servers) {
        console.error("Server:", server);
        console.error("Reason:", details.error?.message || "Unknown");
      }
    }

    process.exit(1);
  }
};

module.exports = connectDB;