var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const upload = require("./service/multer");
const User = require("./modal/user");
const { addUser } = require("./controller/user");
const Messages = require("./modal/messages");
const { initSocket } = require("./service/socketservice");

//Mongoose Connection
mongoose
  .connect("mongodb://localhost:27017/chatapp")
  .then(() => {
    console.log("Connection Successfully");
  })
  .catch((err) => {
    console.log("Received an Error:", err.message);
  });

//Imports Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const conversationRouter = require("./routes/conversation");
const messageRouter = require("./routes/messages");

var app = express();
app.use(cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("/public", path.join(__dirname, "public"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/conversation", conversationRouter);
app.use("/login", loginRouter);
app.use("/messages", messageRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 3030;
app.set("port", PORT);
// Cors setup
const corsOptions = {
  origin: "*", // Allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
const server = http.createServer(app);
//socket.io
// Initialize Socket.IO
initSocket(server);

// socket.on("sendMessage", async (data) => {
//   io.emit("receivedMessage", data);
// });
// socket.on("disconnect", async () => {
//   console.log("User disconnected");
// });
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
