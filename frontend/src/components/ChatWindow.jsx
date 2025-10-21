import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { socket } from "../lib/socket";

export default function ChatWindow({ convo, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    if (!convo) return;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${convo._id}/messages`);
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
    socket.emit("joinConvo", convo._id);

    return () => {
      socket.emit("leaveConvo", convo._id);
      setMessages([]);
    };
  }, [convo]);

  useEffect(() => {
    const handler = (msg) => {
      if (msg.conversation === convo._id) {
        setMessages((m) => [...m, msg]);
      }
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [convo]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const payload = { convoId: convo._id, senderId: currentUser._id, content: text };
      // emit via socket for real-time
      socket.emit("sendMessage", payload);

      // also POST to server for persistence normally
      await axiosInstance.post(`/chat/${convo._id}/messages`, { content: text });
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  if (!convo) return <div className="flex-1 flex items-center justify-center">Select a conversation</div>;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b font-semibold">Conversation</div>
      <div className="p-4 flex-1 overflow-auto">
        {messages.map((m) => (
          <div key={m._id} className={`mb-3 ${m.sender._id === currentUser._id ? 'text-right' : 'text-left'}`}>
            <div className="inline-block bg-gray-100 p-2 rounded">
              <div className="text-sm font-medium">{m.sender.name}</div>
              <div className="text-sm">{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="p-4 border-t flex gap-2">
        <input className="flex-1 border rounded p-2" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message..." />
        <button className="btn btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
