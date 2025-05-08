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
    res.status(400).json({ error: "Participants are required" });
    return;
  }

  const chatId = uuidv4();
  const participants = [...new Set([userId, ...participantIds])];
  const result = await createGroupChat({
    groupId: chatId,
    name: "SkinSense Support Group",
    members: participants,
    createdAt: new Date().toISOString(),
  });
  
  
  res.status(201).json(result);
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  const senderId = req.user?.userId;
  const { chatId, text } = req.body;

  if (!senderId || !chatId || !text) {
    res.status(400).json({ error: "chatId and message text are required" });
    return;
  }

  const result = await addMessageToChat(chatId, senderId, text);
  res.status(200).json(result);
};

export const fetchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const messages = await getChatMessages(chatId);
  res.status(200).json({ messages });
};

