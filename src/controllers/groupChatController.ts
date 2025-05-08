import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  createGroupChat,
  addMessageToChat,
  getChatMessages,
} from "../services/groupChatService";

export const startGroupChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { participantIds } = req.body;

  if (!userId || !participantIds?.length) {
    res.status(400).json({ error: "Participants are required." });
    return;
  }

  try {
    const chatId = uuidv4();
    const participants = [...new Set([userId, ...participantIds])];

    const result = await createGroupChat({
      groupId: chatId,
      name: "SkinSense Support Group",
      members: participants,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "Group chat created", data: result });
  } catch (err) {
    console.error("Error starting group chat:", err);
    res.status(500).json({ error: "Failed to create group chat." });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const senderId = req.user?.userId;
  const { chatId, text } = req.body;

  if (!senderId || !chatId || !text) {
    res.status(400).json({ error: "chatId and message text are required." });
    return;
  }

  try {
    const result = await addMessageToChat(chatId, senderId, text);
    res.status(200).json({ message: "Message sent", data: result });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
};

export const fetchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).json({ error: "chatId is required." });
    return;
  }

  try {
    const messages = await getChatMessages(chatId);
    res.status(200).json({ messages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
};


