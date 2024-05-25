import React, { useEffect, useMemo, useState } from "react";
import axios, { all } from "axios";
import { io } from "socket.io-client";

const App = () => {
  let [allMessages, setAllMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [user, setUser] = useState("");
  let [room, setRoom] = useState("");
  let [chatName, setChatName] = useState("");

  useEffect(() => {
    let name = prompt("Enter your name");
    setUser(name);
  }, []);

  const socket = useMemo(() => io("http://localhost:4000"), []);

  useEffect(() => {
    if (user && chatName) {
      socket.emit("userEnter", chatName, user);
    }
  }, [user, chatName]);

  useEffect(() => {
    const handleMessage = (message) => {
      setAllMessages((prev) => [...prev, { message, owner: "others" }]);
    };

    const handleReceiveMessage = (message) => {
      setAllMessages((prev) => [...prev, { message, owner: "others" }]);
    };

    socket.on("message", handleMessage);
    socket.on("receiveMessage", handleReceiveMessage);
    return () => {
      socket.off("message", handleMessage);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [allMessages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (chatName) {
      setAllMessages((prev) => [...prev, { message, owner: user }]);
      socket.emit("sendMessage", chatName, message);
      setMessage("");
    } else {
      alert("Please enter chat name");
    }
  };

  const createRoom = (e) => {
    e.preventDefault();
    socket.emit("createRoom", room);
    setRoom("");
  };

  const enterRoom = (e) => {
    e.preventDefault();
    setChatName(e.target[0].value);
    e.target[0].value = "";
  };

  return (
    <div>
      <div className="h-10 w-full bg-[teal] grid place-content-center text-white font-bold text-xl">
        Simple Chat App
      </div>

      <div className="flex justify-center gap-5 mt-5 mb-3">
        <form onSubmit={createRoom}>
          <input
            type="text"
            autoComplete="off"
            value={room}
            placeholder="Enter room name"
            onChange={(e) => setRoom(e.target.value)}
            className="border border-[gray] rounded-md pl-2 outline-none h-8"
          />
          <button className="h-8 w-[100px] bg-red-600 text-white rounded-md ml-3">
            Create Room
          </button>
        </form>
        <form onSubmit={enterRoom}>
          <input
            type="text"
            autoComplete="off"
            placeholder="Enter room name"
            className="border border-[gray] rounded-md pl-2 outline-none h-8"
          />
          <button className="h-8 w-[100px] bg-red-600 text-white rounded-md ml-3">
            Enter Chat
          </button>
        </form>
      </div>

      <div className="h-[75vh] w-[50%] m-auto bg-gray-900 overflow-y-auto py-5 px-5 relative">
        {allMessages.map((ele, index) => (
          <div key={index} className={`flex text-white mb-3 ${ele.owner === "others" ? "justify-end" : "justify-start"}`}>
            <div className="bg-gray-400 rounded-xl inline-block w-auto px-3 py-[6px]">
              {ele.message}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="fixed bottom-2 left-0 w-full flex justify-center">
        <input
          type="text"
          placeholder="enter message..."
          autoComplete="off"
          name="message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          className="h-10 w-[45%] border border-[teal] outline-none rounded-md pl-2"
        />
        <button type="submit" className="h-10 w-[100px] bg-teal-800 rounded-md font-semibold text-white ml-1">
          Send
        </button>
      </form>
    </div>
  );
};

export default App;
