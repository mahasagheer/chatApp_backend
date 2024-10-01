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
  const emailToSocketIdMap = new Map();
  const socketIdToEmailMap = new Map();
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
    socket.on("join-room", (data) => {
      const { email, room } = data;
      emailToSocketIdMap.set(email, socket.id);
      socketIdToEmailMap.set(socket.id, email);
      io.to(room).emit("user-joined", { email: email, id: socket.id });
      socket.join(room);
      io.to(socket.id).emit("join-room", data);
    });

    socket.on("user-call", ({ to, offer }) => {
      console.log("Backend received call:", to, offer); // Check backend
      io.to(to).emit("incoming-call", { from: socket.id, offer });
    });

    socket.on("call-accepted", ({ to, answer }) => {
      console.log("call accepted:", to, answer);
      io.to(to).emit("call-accepted", {
        form: socket.id,
        answer,
      });
    });
    socket.on("peer:nego:needed", ({ to, offer }) => {
      console.log("peer nego needed", offer);
      io.to(to).emit("peer:nego:needed", {
        form: socket.id,
        offer,
      });
    });
    socket.on("peer:nego:done", ({ to, answer }) => {
      console.log("peer done", answer);
      io.to(to).emit("peer:nego:final", {
        form: socket.id,
        answer,
      });
    });
    socket.on("endCall", () => {
      console.log("Call end");
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
    console.log(users);

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
