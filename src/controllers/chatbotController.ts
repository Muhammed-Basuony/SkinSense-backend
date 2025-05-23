import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  saveChatToDynamoDB,
  getChatHistoryFromDynamoDB,
} from "../utils/dynamoUtils";
import { sendNotification } from "../utils/notificationUtils";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: ChatMessage;
  }>;
}


export const askChatbot = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { message } = req.body;
  const userId = req.user?.userId;

  if (!message || !userId) {
    res.status(400).json({ error: "Message and userId are required" });
    return;
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data: OpenRouterResponse = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "No reply from chatbot.";

    await saveChatToDynamoDB(userId, message, reply);

    await sendNotification(userId, "chat", "New reply from chatbot", reply);

    res.status(200).json({ reply });
  } catch (err: any) {
    console.error("Chatbot error:", err?.response?.data || err.message);
    res
      .status(500)
      .json({ error: "Something went wrong with the chatbot" });
  }
};


export const askChatWithImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { message } = req.body;
  const image = req.file;

  if (!userId || (!message && !image)) {
    res
      .status(400)
      .json({ error: "Either message or image is required." });
    return;
  }

  try {
    const imageUrl = image ? (image as any).location : null;

    const prompt = message || "Please analyze the uploaded image.";

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data: OpenRouterResponse = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "No reply from chatbot.";

    await saveChatToDynamoDB(
      userId,
      message || "[Image only]",
      reply,
      imageUrl
    );


    await sendNotification(
      userId,
      "chat",
      "New reply from chatbot",
      `${message || "[Image only]"}\n\n${reply}${
        imageUrl ? `\n\nImage: ${imageUrl}` : ""
      }`
    );

    res.status(200).json({ reply, imageUrl });
  } catch (err: any) {
    console.error("Chatbot image chat error:", err.message);
    res.status(500).json({ error: "Failed to chat with AI" });
  }
};


export const getChatHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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
    res
      .status(500)
      .json({ error: "Unable to retrieve chat history" });
  }
};
