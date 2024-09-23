const { Server } = require("socket.io");
let io;

let users = [];
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("new user", socket.id);
    socket.on("addUser", (id) => {
      const isUserExist = users.find((user) => user.userId === id);
      if (!isUserExist) {
        const user = { userId: id, socketId: socket.id };
        users.push(user);
        io.emit("getUsers", users);
      }
    });
    socket.on(
      "sendMessage",
      ({ senderId, receiverId, conversationId, message }) => {
        const receiver = users.find((user) => user.userId === receiverId);
        const sender = users.find((user) => user.userId === senderId);

        if (receiver) {
          io.to(receiver.socketId).emit("getMessage", {
            senderId,
            receiverId,
            conversationId,
            message,
          });
        }

        if (sender) {
          io.to(sender.socketId).emit("getMessage", {
            senderId,
            receiverId,
            conversationId,
            message,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      users = users.filter((user) => user.socketId != socket.id);
      io.emit("getUsers", users);
    });
  });
};
module.exports = { initSocket };
