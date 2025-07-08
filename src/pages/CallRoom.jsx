// src/pages/CallRoom.jsx
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VideoCall from "../components/VideoCall";

export default function CallRoom() {
  const { room } = useParams();
  const { tokenPayload } = useAuth();      // or however you get current UID
  return <VideoCall room={room} uid={tokenPayload.uid} />;
}
