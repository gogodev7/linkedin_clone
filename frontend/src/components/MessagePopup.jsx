import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { socket } from "../lib/socket";
import ChatWindow from "./ChatWindow";

export default function MessagePopup() {
  const { data: currentUser } = useQuery({ queryKey: ["authUser"], queryFn: async () => {
    try { const res = await axiosInstance.get('/auth/me'); return res.data; } catch { return null; }
  }});

  const [open, setOpen] = useState(false);
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const load = async () => {
      try {
        const res = await axiosInstance.get('/chat');
        setConvos(res.data);
        if (res.data.length) setSelected(res.data[0]);
      } catch (err) { console.error(err); }
    };
    load();
  }, [currentUser]);

  useEffect(() => {
    const handler = (msg) => {
      // quick update: move convo to top and append message if open
      setConvos((prev) => {
        const idx = prev.findIndex((c) => c._id === msg.conversation);
        let copy = [...prev];
        if (idx !== -1) {
          const convo = { ...copy[idx], lastMessage: msg.content };
          copy.splice(idx, 1);
          copy.unshift(convo);
        }
        return copy;
      });
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, []);

  if (!currentUser) return null;

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <button
            className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open messages"
          >
            💬
          </button>

          {open && (
            <div className="w-96 h-128 bg-white border rounded shadow-lg mt-2 overflow-hidden flex flex-col">
              <div className="p-2 border-b flex items-center justify-between">
                <div className="font-medium">Messages</div>
                <button onClick={() => setOpen(false)} className="text-sm text-gray-500">Close</button>
              </div>
              <div className="flex-1 flex">
                <div className="w-1/3 border-r overflow-auto">
                  {convos.map((c) => (
                    <div key={c._id} className="p-2 hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(c)}>
                      <div className="font-medium">{c.participants.find(p => p._id !== currentUser._id)?.name || 'Conversation'}</div>
                      <div className="text-sm text-gray-600">{c.lastMessage || 'No messages yet'}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-1">
                  <ChatWindow convo={selected} currentUser={currentUser} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
