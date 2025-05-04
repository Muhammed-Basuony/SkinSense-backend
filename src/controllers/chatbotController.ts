import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";
import { saveChatToDynamoDB, getChatHistoryFromDynamoDB } from "../utils/dynamoUtils";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-3.5-turbo";

export const askChatbot = async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const userId = req.user?.userId;

  if (!message || !userId) {
    return res.status(400).json({ error: "Message and userId are required" });
  }

  interface OpenRouterResponse {
    choices: { message: { content: string } }[];
  }
  
  try {
    const response = await axios.post<OpenRouterResponse>(
      OPENROUTER_URL,
      {
        model: MODEL,
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
  
    const reply = response.data.choices?.[0]?.message?.content || "No reply.";
  
    await saveChatToDynamoDB(userId, message, reply);
    res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Chatbot error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong with the chatbot" });
  }
  
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const history = await getChatHistoryFromDynamoDB(userId);
    res.status(200).json({ history });
  } catch (err: any) {
    console.error("Fetch history error:", err.message);
    res.status(500).json({ error: "Unable to retrieve chat history" });
  }
};

