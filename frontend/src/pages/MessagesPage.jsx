import React, { useEffect, useState } from "react";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import { axiosInstance } from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

export default function MessagesPage() {
  const { data: currentUser } = useQuery({ queryKey: ["authUser"], queryFn: async () => {
    try { const res = await axiosInstance.get('/auth/me'); return res.data; } catch { return null; }
  }});

  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const loadConvos = async () => {
      try {
        const res = await axiosInstance.get('/chat');
        setConvos(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      } catch (err) { console.error(err); }
    };
    loadConvos();
  }, []);

  return (
    <div className="flex h-full">
      <ChatList conversations={convos} onSelect={setSelected} />
      <ChatWindow convo={selected} currentUser={currentUser} />
    </div>
  );
}
