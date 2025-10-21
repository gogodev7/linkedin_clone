import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createConversation, getConversations, getMessages, sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", protectRoute, createConversation); // body: { participantId }
router.get("/", protectRoute, getConversations);
router.get("/:convoId/messages", protectRoute, getMessages);
router.post("/:convoId/messages", protectRoute, sendMessage);

export default router;
