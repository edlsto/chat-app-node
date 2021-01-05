const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");

const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.emit("message", "Welcome!");
  socket.broadcast.emit("message", "A new user has joined");

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    io.emit("message", message);
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "locationMessage",
      `https://google.com/maps?q=${location.lat},${location.long}`
    );
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left");
  });

  // socket.emit("countUpdated", count);

  // socket.on("increment", () => {
  //   count++;
  //   // socket.emit("countUpdated", count);
  //   io.emit("countUpdated", count);
  // });
});

server.listen(port, () => {
  console.log("Server is up on port " + port);
});