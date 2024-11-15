const express = require("express");
const socketio = require("socket.io");
const httpServer = require("node:http");
const path = require("path");

//setting up the server
const port = process.env.PORT || 8080;
const app = express();
const server = httpServer.createServer(app);
const io = socketio(server);

const publicDir = path.join(__dirname, "../public/");
app.use(express.static(publicDir));

io.on("connection", (socket) => {
  console.log("socket connected");

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
});

server.listen(port, () => console.log(`Listening to port ${port}`));
