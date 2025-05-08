import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";
import { saveChatToDynamoDB, getChatHistoryFromDynamoDB } from "../utils/dynamoUtils";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-3.5-turbo";
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   baseURL: 'https://openrouter.ai/api/v1',
//   apiKey: OPENROUTER_API_KEY,
  
// });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: ChatMessage;
  }>;
}

export const askChatbot = async (req: AuthRequest, res: Response): Promise<void> => {
  const { message } = req.body;
  const userId = req.user?.userId;

  if (!message || !userId) {
    res.status(400).json({ error: "Message and userId are required" });
    return;
  }

  try {
    // const response = await openai.chat.completions.create({
    //     model: MODEL,
    //     messages: [{ role: "user", content: message }],
    //   },
    // );

    //const reply = response.data?.choices?.[0]?.message?.content || "No reply.";

    // await saveChatToDynamoDB(userId, message, reply);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + OPENROUTER_API_KEY,
    
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'What is the meaning of life?',
          },
        ],
      }),
    });

    res.status(200).json({ response });
  } catch (err: any) {
    console.error("Chatbot error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong with the chatbot" });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const history = await getChatHistoryFromDynamoDB(userId);
    res.status(200).json({ history });
  } catch (err: any) {
    console.error("Fetch history error:", err.message);
    res.status(500).json({ error: "Unable to retrieve chat history" });
  }
};

 

