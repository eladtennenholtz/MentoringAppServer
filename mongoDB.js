const mongoose = require("mongoose");

async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/codeBlocksDB", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
const CodeBlockSchema = new mongoose.Schema({
  id: String,
  title: String,
  code: String,
  createdBy: String,
  updatedAt: { type: Date, default: Date.now },
});

const CodeBlock = mongoose.model("CodeBlock", CodeBlockSchema);

module.exports = { connectToMongoDB, CodeBlock };
