// no default React import needed with the new JSX transform

export default function ChatList({ conversations, onSelect }) {
  return (
    <div className="w-1/3 border-r">
      <h3 className="p-4 font-semibold">Chats</h3>
      <ul>
        {conversations.map((c) => {
          // simplify display: pick first participant (frontend will supply current-user-aware lists)
          const display = c.participants[0] || {}; 
          return (
            <li key={c._id} className="p-3 hover:bg-gray-100 cursor-pointer" onClick={() => onSelect(c)}>
              <div className="font-medium">{display.name || display.username}</div>
              <div className="text-sm text-gray-500">{c.lastMessage || "No messages yet"}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
