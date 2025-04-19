// src/controllers/chatbotController.ts
import { Request, Response } from "express";
import { ChatbotService } from "../services/chatbotService";

const chatbotService = new ChatbotService();

export const askChatbot = async (req: Request, res: Response) => {
  const { message, userId } = req.body;

  if (!message || !userId) {
    return res.status(400).json({ error: "Message and userId are required" });
  }

  try {
    const result = await chatbotService.askQuestion(userId, message);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getChatHistory = async (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const history = await chatbotService.getChatHistory(userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


