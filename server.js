const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
async function connectToMongoDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/codeBlocksDB");

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Handle the error appropriately (e.g., throw an exception or exit the application)
  }
}

// Call the async function to connect to MongoDB
connectToMongoDB();

const CodeBlock = mongoose.model("CodeBlock", {
  id: String,
  title: String,
  code: String,
});
const codeBlock = new CodeBlock({
  id: "async-case",
  title: "Async Case",
  code: "This is the code of the async",
});

const codeBlocks = [
  {
    id: "async-case",
    title: "Async Case",
    code: "This is the code of the async",
  },
  // ... other code blocks ...
];

//Save the document using async/await
async function saveDocument() {
  try {
    await codeBlock.save();
    console.log("meow");
    console.log("Document saved successfully");
  } catch (error) {
    console.error("Error saving document:", error);
  }
}

// Call the async function to save the document
saveDocument();

// MongoDB connection URL and database name
// const mongoURL = "mongodb://localhost:27017";
// const dbName = "code_blocks_db"; // Replace with your actual database name

// let db;

// Connect to MongoDB
// MongoClient.connect(mongoURL, { useUnifiedTopology: true }, (err, client) => {
//   if (err) {
//     console.error("Error connecting to MongoDB:", err);
//     return;
//   }

//   console.log("Connected to MongoDB");

//   // Select the database
//   db = client.db(dbName);

// Continue with your Socket.IO code

const connectedClients = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  connectedClients.push(socket.id);
  const roleClient = connectedClients.length === 1 ? "mentor" : "student";
  console.log(roleClient);
  console.log(connectedClients);
  socket.emit("role", { clientId: socket.id, role: roleClient });
  // Send initial code blocks to the connected user
  socket.emit("initial_code_blocks", codeBlocks);

  socket.on("send_message", async (data) => {
    // Save the message to MongoDB
    //   await db.collection("messages").insertOne({
    //     id: data.id,
    //     message: data.message,
    //   });

    // Broadcast the message to all connected clients, excluding the sender
    console.log(data);
    socket.broadcast.emit("receive_message", {
      message: data.message,
      id: data.id,
    });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
    const index = connectedClients.indexOf(socket.id);
    if (index !== -1) {
      connectedClients.splice(index, 1);
    }
  });
});
// });

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
