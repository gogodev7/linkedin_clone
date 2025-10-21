import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";


// Socket.IO setup for real-time chat
import http from "http";
import { Server as IOServer } from "socket.io";
import Message from "./models/message.model.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
    app.use(
        cors({
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        })
    );
}

app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

// Ensure uploads directory exists and serve it statically
const uploadsDir = path.join(__dirname, "backend", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/api/v1/uploads", express.static(uploadsDir));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/chat", chatRoutes);

const server = http.createServer(app);

const io = new IOServer(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// Simple socket auth via cookie is possible but for now we accept a userId upon connection
io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinConvo", (convoId) => {
        socket.join(convoId);
    });

    socket.on("leaveConvo", (convoId) => {
        socket.leave(convoId);
    });

    socket.on("sendMessage", async (payload) => {
        // payload: { convoId, senderId, content }
        try {
            const { convoId, senderId, content } = payload;
            if (!convoId || !senderId || !content) return;

            const message = new Message({ conversation: convoId, sender: senderId, content });
            await message.save();

            await message.populate("sender", "name username profilePicture");

            io.to(convoId).emit("newMessage", message);
        } catch (error) {
            console.error("Error in socket sendMessage:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
    });
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});
