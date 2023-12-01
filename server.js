const express = require("express");
const http = require("http");
const cors = require("cors");
const initSocketIO = require("./socket");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Call the function to initialize socket.io
initSocketIO(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
