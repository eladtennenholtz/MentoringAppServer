const express = require("express");
const mongoose = require("mongoose");
const app = express();
async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/test");

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    // Handle the error appropriately (e.g., throw an exception or exit the application)
  }
}

// Call the async function to connect to MongoDB
connectToMongoDB();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
