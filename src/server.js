const express = require("express");
const app = express();
const connectDatabase = require("./configs/db");
const dotenv = require("dotenv");
const path = require("path");
const { Socket } = require("socket.io");
const UserRoutes = require("./routers/userRoues")
const chatRoutes = require("./routers/chatRoutes")
const messegeRoutes = require("./routers/messageRoutes")
const {notFound, errorHandler} = require("./middlewares/errorMiddleware")

// thư mục hiện tại có thể không giống với thư mục của tệp mô-đun hiện tại.
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  // Nếu nó được đặt thành "production," đó có nghĩa là ứng dụng đang chạy trong môi trường sản xuất.
  // Mã cho môi trường sản xuất
  // phục vụ các tệp tĩnh từ thư mục /frontend/build.các ứng dụng được xây dựng bằng các framework frontend. nơi build cuối cùng sản phẩm nằm trong một thư mục cụ thể.
  app.use(express.static(path.join(__dirname1, "/FE-chatAPP/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "BE-chatAPP", "build", "index.html"))
  );
} else {
  // Mã cho môi trường phat trien
  app.get("/", (req, res) => {
    res.send("run API...");
  });
}

// routes
app.use("/api/user", UserRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/message", chatRoutes)

//connect dotenv and datatabsse
dotenv.config();
connectDatabase();

// error 
app.use(notFound);
app.use(errorHandler)

//port: localhost
const PORT = 3000;
const server = app.listen(PORT, console.log(`run success... ${PORT}`));

//connect socket.io
const io = require("socket.io")(server, {
  pingTimeout: 6000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  //connect socket.io
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  //join chat
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room: ", +room);
  });

  //type text
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  //stop type
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  //new messager
  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("message reaieved", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("user disconnected");
    socket.leave(userData._id);
  });
});
