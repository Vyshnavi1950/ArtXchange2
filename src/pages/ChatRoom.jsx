import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { io } from "socket.io-client"; // prefer named import
import axios from "axios";
import "../styles/ChatRoom.css";

const API = import.meta.env.VITE_API_URL || "https://artxchange1.onrender.com";

export default function ChatRoom() {
  const { partnerId } = useParams();
  const nav = useNavigate();
  const { user } = useAuth(); // { _id, token }
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef(null);
  const [socket, setSocket] = useState(null);

  /* -------- Initialize socket when user.token is ready -------- */
  useEffect(() => {
    if (!user?.token) return;

    const newSocket = io(API, {
      auth: { token: user.token },
      autoConnect: false,
    });

    setSocket(newSocket);
    newSocket.connect();

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err.message === "Authentication error") {
        // Token invalid or expired - maybe logout user or refresh token here
        alert("Session expired. Please login again.");
        nav("/login");
      }
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user?.token, nav]);

  /* -------- load chat history -------- */
  useEffect(() => {
    if (!partnerId || !user?.token) return;
    (async () => {
      try {
        const { data } = await axios.get(`${API}/api/chat/${partnerId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(data);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        if (error.response?.status === 401) {
          alert("Session expired. Please login again.");
          nav("/login");
        }
      }
    })();
  }, [partnerId, user?.token, nav]);

  /* -------- Listen for new incoming messages -------- */
  useEffect(() => {
    if (!socket) return;

    const onNew = (msg) => {
      if (
        (msg.from === partnerId && msg.to === user._id) ||
        (msg.from === user._id && msg.to === partnerId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on("chat:new", onNew);
    return () => socket.off("chat:new", onNew);
  }, [socket, partnerId, user?._id]);

  /* -------- scroll to bottom on new messages -------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -------- send message -------- */
  const send = () => {
    const text = draft.trim();
    if (!text || !socket) return;
    socket.emit("chat:send", { to: partnerId, text });
    setDraft("");
  };

  return (
    <>
      <div className="chat-viewport-bg" onClick={() => nav(-1)} />

      <div className="chat-room">
        <div className="chat-modal">
          <header>
            <span>Chat</span>
            <button onClick={() => nav(-1)}>×</button>
          </header>

          <div className="chat-scroll">
            {messages.map((m) => (
              <div
                key={m._id}
                className={`bubble ${m.from === user._id ? "mine" : "theirs"}`}
                data-time={new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              autoComplete="off"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </>
  );
}
