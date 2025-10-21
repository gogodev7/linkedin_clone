import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";
// derive socket URL from API_BASE (if API_BASE includes host) otherwise use same origin
let socketUrl = undefined;
try {
  const url = new URL(API_BASE, window.location.origin);
  socketUrl = url.origin;
} catch (e) {
  socketUrl = undefined;
}

export const socket = io(socketUrl || undefined, { transports: ["websocket", "polling"] });
