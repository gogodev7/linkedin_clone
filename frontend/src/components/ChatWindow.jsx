import React, { useEffect, useState, useRef } from "react";
import { axiosInstance } from "../lib/axios";
import { socket } from "../lib/socket";

export default function ChatWindow({ convo, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef();
  const inputRef = useRef();

  // Fetch messages and join convo on mount / convo change
  useEffect(() => {
    if (!convo) {
      setMessages([]);
      return;
    }

    let mounted = true;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${convo._id}/messages`);
        if (mounted) {
          // assume server returns an array in res.data
          setMessages(res.data || []);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load messages.");
      }
    };

    fetchMessages();

    socket.emit("joinConvo", convo._id);
    inputRef.current?.focus();

    return () => {
      mounted = false;
      socket.emit("leaveConvo", convo._id);
      setMessages([]);
    };
  }, [convo]);

  // Listen for incoming messages
  useEffect(() => {
    if (!convo) return;
    const handler = (msg) => {
      // message shape may vary; adjust property name if needed
      const convoId = msg.conversation || msg.convoId || msg.convo || msg.convo_id;
      if (convoId === convo._id) {
        setMessages((m) => [...m, msg]);
      }
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [convo]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    setIsSending(true);
    setError(null);

    try {
      const payload = { convoId: convo._id, senderId: currentUser._id, content: trimmedText };

      // emit via socket for real-time
      socket.emit("sendMessage", payload);

      // also POST to server for persistence
      await axiosInstance.post(`/chat/${convo._id}/messages`, { content: trimmedText });

      setText("");
      inputRef.current?.focus();
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!convo) return <div className="flex-1 flex items-center justify-center">Select a conversation</div>;

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b font-semibold">Conversation</div>
      <div className="p-4 flex-1 overflow-auto">
        {messages.map((m) => (
          <div key={m._id || m.id} className={`mb-3 ${m.sender && m.sender._id === currentUser._id ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-2 rounded max-w-[85%] ${
                m.sender && m.sender._id === currentUser._id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <div className="text-sm font-medium opacity-75">{m.sender ? m.sender.name : "Unknown"}</div>
              <div className="text-sm whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      {error && (
        <div className="px-4 py-2 text-sm text-red-600 bg-red-50 border-t">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-700 hover:text-red-800">
            Dismiss
          </button>
        </div>
      )}
      <div className="p-4 border-t flex gap-2 items-end">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            className="w-full border rounded p-2 pr-10 resize-none overflow-hidden"
            style={{ minHeight: "40px", maxHeight: "120px" }}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKeyPress}
            placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
            disabled={isSending}
            rows={1}
          />
          {text && <div className="absolute right-2 bottom-2 text-xs text-gray-400">Press Enter ↵</div>}
        </div>
        <button
          className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
            isSending ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          onClick={sendMessage}
          disabled={isSending}
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
