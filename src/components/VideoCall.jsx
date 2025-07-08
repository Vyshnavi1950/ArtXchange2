import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function VideoCall({ room, uid }) {
  const localV  = useRef(null);
  const remoteV = useRef(null);
  const pcRef   = useRef(null);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      auth: { uid },
    });
    socket.emit("webrtc:join-room", room);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        localV.current.srcObject = stream;
      });

    pc.ontrack = (e) => { remoteV.current.srcObject = e.streams[0]; };
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("webrtc:signal", { room, data: { candidate: e.candidate } });
    };

    socket.on("webrtc:signal", async ({ data }) => {
      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:signal", { room, data: { sdp: pc.localDescription } });
        }
      } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    (async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:signal", { room, data: { sdp: pc.localDescription } });
    })();

    return () => {
      socket.disconnect();
      pc.close();
    };
  }, [room, uid]);

  return (
    <div className="video-wrapper">
      <video ref={localV}  autoPlay playsInline muted className="local"  />
      <video ref={remoteV} autoPlay playsInline        className="remote" />
    </div>
  );
}
