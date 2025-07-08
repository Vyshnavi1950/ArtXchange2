import { io } from "socket.io-client";

export const socket = io("https://artxchange1.onrender.com", {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});
