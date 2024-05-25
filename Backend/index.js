import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";

let app = express();
dotenv.config({ path: "./.env" });
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
let port = process.env.PORT || 5000;

let server=createServer(app);
let io=new Server(server,{
cors:{
    origin:"http://localhost:5173",
    methods:["get","post","put","delete"],
    credentials:true
}
});

io.on("connection", (socket) => {
    socket.on("createRoom",(room)=>{
      socket.join(room);
      console.log("room created"+room);
    });

    socket.on("userEnter",(chatRoom,user)=>{
      socket.join(chatRoom);
      console.log(user+" joined the chat")
      socket.user=user;
      socket.room=chatRoom;
      socket.broadcast.to(chatRoom).emit("message",user+" joined the chat");
    });
    socket.on("sendMessage",(chatRoom,message)=>{
      console.log({chatRoom,message})
      socket.broadcast.to(chatRoom).emit("receiveMessage",message);
    });
    socket.on("disconnect",()=>{
        socket.broadcast.to(socket.room).emit("message",socket.user+" left the chat");
    })
});

server.listen(port, () => {
  console.log("App is running at port:" + port);
});
