const mongoose = require("mongoose");
//connection to mongo
async function connectToMongoDB() {
  try {
    await mongoose.connect(
      "mongodb://mongo:5CFceB3gAaa-F3eEBD4Fh-HA5515326F@mongodb.railway.internal:27017",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

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
  solution: String,
});

const CodeBlock = mongoose.model("CodeBlock", CodeBlockSchema);

module.exports = { connectToMongoDB, CodeBlock };
