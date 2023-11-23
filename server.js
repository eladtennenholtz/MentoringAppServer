const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
//sdf

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["*"],
  },
});

async function connectToMongoDB() {
  try {
    await mongoose.connect(
      "mongodb://mongo:5CFceB3gAaa-F3eEBD4Fh-HA5515326F@monorail.proxy.rlwy.net:57262",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    // Check if the database exists, create it if not
    const adminDb = mongoose.connection.db.admin();
    const databases = await adminDb.listDatabases();
    const databaseExists = databases.databases.some(
      (db) => db.name === "codeBlocksDB"
    );

    if (!databaseExists) {
      await adminDb.createDatabase("codeBlocksDB");
    }
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Call the async function to connect to MongoDB
connectToMongoDB();

const CodeBlockSchema = new mongoose.Schema({
  id: String,
  title: String,
  code: String,
  createdBy: String,
  updatedAt: { type: Date, default: Date.now },
});

const CodeBlock = mongoose.model("CodeBlock", CodeBlockSchema);

const connectedClients = [];

// Function to emit all code blocks to a specific client
const emitAllCodeBlocksToClient = async (socket) => {
  try {
    // Query the database to get all code blocks
    const allCodeBlocks = await CodeBlock.find();
    // Send the retrieved code blocks to the client
    socket.emit("all_code_blocks", allCodeBlocks);
  } catch (error) {
    console.error("Error getting all code blocks:", error);
  }
};

io.on("connection", (socket) => {
  connectedClients.push(socket.id);
  const roleClient = connectedClients.length === 1 ? "mentor" : "student";
  socket.emit("role", { clientId: socket.id, role: roleClient });

  // Listen for the "send_initial_code_blocks" event
  socket.on("send_initial_code_blocks", async (initialCodeBlocks) => {
    // Save the received code blocks to the database
    try {
      for (const block of initialCodeBlocks) {
        // Check if the code block already exists in the database
        const existingCodeBlock = await CodeBlock.findOne({ id: block.id });

        if (!existingCodeBlock) {
          const codeBlock = new CodeBlock({
            id: block.id,
            title: block.title,
            code: block.code,
            createdBy: socket.id, // Update this as needed
            updatedAt: Date.now(),
          });

          await codeBlock.save();
        }
      }
    } catch (error) {
      console.error("Error saving initial code blocks:", error);
    }
  });

  socket.on("get_all_code_blocks", async () => {
    // Emit all code blocks to the connected user
    emitAllCodeBlocksToClient(socket);
  });

  socket.on("send_message", async (data) => {
    try {
      // Update the code block in the database
      await CodeBlock.findOneAndUpdate(
        { id: data.id },
        { code: data.message, updatedAt: Date.now() }
      );
    } catch (error) {
      console.error("Error updating code block:", error);
    }

    // Broadcast the updated code block to all connected clients
    socket.broadcast.emit("receive_message", {
      message: data.message,
      id: data.id,
    });
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    const index = connectedClients.indexOf(socket.id);
    if (index !== -1) {
      connectedClients.splice(index, 1);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
