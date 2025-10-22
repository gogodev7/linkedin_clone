import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { socket, registerSocket } from "../lib/socket";
import ChatWindow from "./ChatWindow";

export default function MessagePopup() {
  const { data: currentUser } = useQuery({ queryKey: ["authUser"], queryFn: async () => {
    try { const res = await axiosInstance.get('/auth/me'); return res.data; } catch { return null; }
  }});

  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem('chat-open');
    return saved ? JSON.parse(saved) : false;
  });
  const [minimized, setMinimized] = useState(() => {
    const saved = localStorage.getItem('chat-minimized');
    return saved ? JSON.parse(saved) : false;
  });
  const [convos, setConvos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showConnected, setShowConnected] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // register this socket connection with the server so presence is tracked
    try {
      registerSocket(currentUser);
    } catch (err) {
      console.warn('Failed to register socket for currentUser', err);
    }

    const load = async () => {
      try {
        const res = await axiosInstance.get('/chat');
        setConvos(res.data);
        
        // Restore selected conversation
        const savedConvoId = localStorage.getItem('chat-selected');
        if (savedConvoId) {
          const savedConvo = res.data.find(c => c._id === savedConvoId);
          if (savedConvo) {
            setSelected(savedConvo);
          } else if (res.data.length) {
            setSelected(res.data[0]);
          }
        } else if (res.data.length) {
          setSelected(res.data[0]);
        }
      } catch (err) { console.error(err); }
    };
    load();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('chat-open', JSON.stringify(open));
  }, [open]);

  useEffect(() => {
    localStorage.setItem('chat-minimized', JSON.stringify(minimized));
  }, [minimized]);

  useEffect(() => {
    if (selected) {
      localStorage.setItem('chat-selected', selected._id);
    } else {
      localStorage.removeItem('chat-selected');
    }
  }, [selected]);

  // Handle connected users
  useEffect(() => {
    if (!currentUser) return;

    const handleUserConnect = (users) => {
      setConnectedUsers(users.filter(u => u._id !== currentUser._id));
    };

    const handleUserDisconnect = (payload) => {
      // server may send either an id string or a rich user object
      const id = payload && typeof payload === 'object' ? payload._id : payload;
      setConnectedUsers(prev => prev.filter(u => u._id !== id));
    };

  socket.emit('getConnectedUsers');
    socket.on('connectedUsers', handleUserConnect);
    socket.on('userConnected', (user) => {
      if (user._id !== currentUser._id) {
        setConnectedUsers(prev => [...prev, user]);
      }
    });
    socket.on('userDisconnected', handleUserDisconnect);

    return () => {
      socket.off('connectedUsers', handleUserConnect);
      socket.off('userConnected');
      socket.off('userDisconnected', handleUserDisconnect);
    };
  }, [currentUser]);

  // fetch richer connected users via API when user toggles the connected panel
  useEffect(() => {
    if (!showConnected) return;
    if (!currentUser) return;

    const load = async () => {
      try {
        const res = await axiosInstance.get('/users/connected');
        setConnectedUsers(res.data || []);
      } catch (err) {
        console.error('Failed to fetch connected users via API, falling back to socket list', err);
        // socket events are already wired and will populate connectedUsers
      }
    };
    load();
  }, [showConnected, currentUser]);

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    const isToday = d.toDateString() === now.toDateString();
    if (diff < 60) return 'now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm';
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return d.toLocaleDateString();
  };

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

      // Update unread count if the message is not from the current user
      // and either the chat is minimized or a different conversation is selected
      if (msg.sender._id !== currentUser._id && 
          (!selected || selected._id !== msg.conversation || minimized)) {
        setUnreadCounts(prev => ({
          ...prev,
          [msg.conversation]: (prev[msg.conversation] || 0) + 1
        }));
      }
    };
    socket.on("newMessage", handler);
    return () => socket.off("newMessage", handler);
  }, [currentUser._id, selected, minimized]);

  if (!currentUser) return null;

  return (
    <div>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors duration-200"
            onClick={() => setOpen((o) => !o)}
            aria-label="Open messages"
          >
            <span className="text-xl sm:text-2xl">💬</span>
            {!open && Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[1.2rem] flex items-center justify-center">
                {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          {open && (
            <div 
              className={`bg-white border rounded shadow-lg mt-2 overflow-hidden flex flex-col transition-all duration-200 ${
                minimized ? 'w-64 h-12' : 'w-96 max-h-[80vh] md:max-h-[600px]'
              } max-w-[95vw]`}
              style={{ 
                opacity: minimized && Object.values(unreadCounts).some(count => count > 0) ? '1' : '0.95',
                transform: 'translate3d(0,0,0)'
              }}
            >
              <div className="border-b">
                <div className="p-2 flex items-center justify-between">
                  <div className="font-medium flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span>Messages</span>
                      {!minimized && selected && <span className="text-sm text-gray-500">- {selected.participants.find(p => p._id !== currentUser._id)?.name}</span>}
                    </div>
                    {minimized && Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                        {Object.values(unreadCounts).reduce((a, b) => a + b, 0)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowConnected(show => !show)}
                      className={`text-sm hover:text-gray-700 transition-colors ${showConnected ? 'text-blue-500' : 'text-gray-500'}`}
                      title="Show connected users"
                    >
                      👥 {connectedUsers.length}
                    </button>
                    <button
                      onClick={() => setShowConnected(true)}
                      className="ml-2 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                    >
                      New message
                    </button>
                    <button
                      onClick={() => setMinimized(m => !m)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                      title={minimized ? 'Maximize' : 'Minimize'}
                    >
                      {minimized ? '□' : '▁'}
                    </button>
                    <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-700">
                      ✕
                    </button>
                  </div>
                </div>
                {!minimized && showConnected && (
                  <div className="p-2 bg-gray-50 border-t max-h-32 overflow-y-auto">
                    <div className="text-xs font-medium text-gray-500 mb-1">Connected Users ({connectedUsers.length})</div>
                    <div className="flex flex-wrap gap-1">
                      {connectedUsers.map(user => (
                        <button
                          key={user._id}
                          onClick={async () => {
                            try {
                              const res = await axiosInstance.post('/chat/conversations', {
                                participantId: user._id
                              });
                              const existingConvo = convos.find(c => c._id === res.data._id);
                              if (!existingConvo) {
                                setConvos(prev => [res.data, ...prev]);
                              }
                              setSelected(res.data);
                              setShowConnected(false);
                            } catch (err) {
                              console.error('Failed to start conversation:', err);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded border hover:bg-gray-50 transition-colors text-sm"
                        >
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {user.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {!minimized && (
                <div className="flex-1 flex">
                  <div className="w-1/3 border-r overflow-auto bg-white">
                    <div className="p-2 relative">
                      <span className="absolute left-3 top-2 text-gray-400">🔍</span>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search messages or people"
                        className="w-full border rounded px-8 py-1 text-sm"
                      />
                    </div>
                    <div>
                      {convos.filter(c => {
                        if (!search.trim()) return true;
                        const other = c.participants.find(p => p._id !== currentUser._id);
                        const name = other?.name || '';
                        return name.toLowerCase().includes(search.toLowerCase()) || (c.lastMessage || '').toLowerCase().includes(search.toLowerCase());
                      }).map((c) => {
                        const other = c.participants.find(p => p._id !== currentUser._id) || {};
                        const isSelected = selected?._id === c._id;
                        const isOnline = connectedUsers.some(u => u._id === other._id);
                        return (
                          <div
                            key={c._id}
                            className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => { setSelected(c); setUnreadCounts(prev => ({ ...prev, [c._id]: 0 })); }}
                          >
                            <div className="relative">
                              <img src={other.profilePicture || '/avatar.png'} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
                              {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className={`text-sm ${unreadCounts[c._id] > 0 ? 'font-semibold' : 'font-medium'} truncate`}>{other.name || 'Conversation'}</div>
                                <div className="text-xs text-gray-400">{formatTime(c.updatedAt)}</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className={`text-sm truncate ${unreadCounts[c._id] > 0 ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>{c.lastMessage || 'No messages yet'}</div>
                                {unreadCounts[c._id] > 0 && (
                                  <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCounts[c._id]}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex-1 bg-white">
                    <ChatWindow convo={selected} currentUser={currentUser} connectedUsers={connectedUsers} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
