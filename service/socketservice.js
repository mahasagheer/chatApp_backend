const { Server } = require("socket.io");
const User = require("../modal/user");
let io;

let users = [];
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });
  const onlineStatus = async (id) => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { status: true } },
        { new: true }
      );
    } catch (error) {
      console.error(`Error updating user status: ${error}`);
    }
  };
  // const offlineStatus = async (userId) => {
  //   try {
  //     const userStatus = await User.findOneAndUpdate(
  //       { _id: userId },
  //       {
  //         status: false,
  //       }
  //     );
  //   } catch (err) {
  //     console.error(`Error updating user status: ${error}`);
  //   }
  // };
  io.on("connection", (socket) => {
    console.log("new user", socket.id);
    socket.on("addUser", (id) => {
      const isUserExist = users.find((user) => user.userId === id);
      onlineStatus(id);
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

    socket.on("disconnect", async () => {
      console.log("user Disconnected");
      const disconnectedUser = users.find(
        (user) => user.socketId === socket.id
      );
      if (disconnectedUser) {
        const { userId } = disconnectedUser;
        const userStatus = await User.findOneAndUpdate(
          { _id: userId },
          {
            status: false,
          }
        );
      }
      users = users.filter((user) => user.socketId != socket.id);
      io.emit("getUsers", users);
    });
  });
};
module.exports = { initSocket };
