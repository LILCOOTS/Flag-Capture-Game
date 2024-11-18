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

let roomInfo = {};

io.on("connection", (socket) => {
  console.log("socket connected");

  socket.on("roomJoin", ({ userName, roomName, boxes }) => {
    socket.userName = userName;
    socket.roomName = roomName;

    socket.join(socket.roomName);

    if (!roomInfo[`${socket.roomName}`]) {
      if (boxes) {
        roomInfo[`${socket.roomName}`] = {
          userName: [],
          roomName: socket.roomName,
          boxes: boxes,
        };
      } else {
        console.log("room does not exist");
      }
    }

    roomInfo[`${socket.roomName}`].userName.push(socket.userName);

    socket.broadcast.to(socket.roomName).emit("print", roomInfo);
    socket.emit("createGame", roomInfo[`${socket.roomName}`]);

    socket.emit("systemMsg", `Welcome ${socket.userName}`);
    socket.broadcast
      .to(socket.roomName)
      .emit("systemMsg", `${socket.userName} has joined!`);
  });

  socket.on("sendMsg", (msg) => {
    io.emit("systemMsg", `${socket.userName}: ${msg}`);
  });

  socket.on("changeColor", (boxIndex) => {
    console.log(boxIndex);
    socket.broadcast.to(socket.roomName).emit("change", boxIndex);
  });

  socket.on("disconnect", () => {
    if (
      roomInfo[`${socket.roomName}`] &&
      roomInfo[`${socket.roomName}`].userName
    ) {
      console.log(roomInfo[`${socket.roomName}`].userName);
      roomInfo[`${socket.roomName}`].userName = roomInfo[
        `${socket.roomName}`
      ].userName.filter((name) => name !== socket.userName);

      if (roomInfo[`${socket.roomName}`].userName.length === 0) {
        delete roomInfo[`${socket.roomName}`];
      }
    }
    socket.broadcast.to(socket.roomName).emit("print", roomInfo);
    console.log("socket disconnected");
  });
});

server.listen(port, () => console.log(`Listening to port ${port}`));
