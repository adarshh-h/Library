const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("[DB] MONGO_URI is not set.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅  MongoDB connected:`);
  } catch (error) {
    console.error("[DB] Connection failed:", error.message);
    process.exit(1);
  }
};

// Log connection events
mongoose.connection.on("disconnected", () =>
  console.warn("[DB] MongoDB disconnected. Attempting reconnect…")
);
mongoose.connection.on("reconnected", () =>
  console.log("[DB] MongoDB reconnected.")
);
mongoose.connection.on("error", (err) =>
  console.error("[DB] Mongoose error:", err.message)
);

module.exports = connectDB;
