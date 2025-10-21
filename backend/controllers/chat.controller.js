import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user._id;

    if (!participantId) return res.status(400).json({ message: "participantId is required" });

    // check if participants are connected
    const participant = await User.findById(participantId);
    if (!participant) return res.status(404).json({ message: "Participant not found" });

    if (!req.user.connections.includes(participantId) && participantId.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: "You can only chat with your connections" });
    }

    // check existing conversation
    let convo = await Conversation.findOne({ participants: { $all: [currentUserId, participantId] } });
    if (convo) return res.json(convo);

    convo = new Conversation({ participants: [currentUserId, participantId] });
    await convo.save();

    res.status(201).json(convo);
  } catch (error) {
    console.error("Error in createConversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const convos = await Conversation.find({ participants: userId })
      .populate("participants", "name username profilePicture")
      .sort({ updatedAt: -1 });

    res.json(convos);
  } catch (error) {
    console.error("Error in getConversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const convoId = req.params.convoId;
    const userId = req.user._id;

    const convo = await Conversation.findById(convoId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    // ensure user is participant
    if (!convo.participants.map((p) => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ conversation: convoId }).populate("sender", "name username profilePicture").sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const convoId = req.params.convoId;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim() === "") return res.status(400).json({ message: "Message content is required" });

    const convo = await Conversation.findById(convoId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    if (!convo.participants.map((p) => p.toString()).includes(userId.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = new Message({ conversation: convoId, sender: userId, content });
    await message.save();

    convo.lastMessage = content;
    convo.lastSender = userId;
    await convo.save();

    // populate sender for response
    await message.populate("sender", "name username profilePicture");

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};
