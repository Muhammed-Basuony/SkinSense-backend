import axios from "axios";
import FormData from "form-data";
import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  saveChatToDynamoDB,
  getChatHistoryFromDynamoDB,
} from "../utils/dynamoUtils";
import { sendNotification } from "../utils/notificationUtils";

const HF_API_URL = "https://mohmadessam-1-burn-classification.hf.space/predict";
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

interface HFResponse {
  label: string;
  confidence: number;
}

interface S3File extends Express.Multer.File {
  location: string;
}

export const askChatWithImage = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const image = req.file as S3File;
  const message = req.body?.message;

  if (!userId || (!image && !message)) {
    res.status(400).json({ error: "Missing image or message" });
    return;
  }

  try {
    let reply = "";
    let imageUrl: string | null = image?.location || null;

    if (imageUrl) {
      const form = new FormData();
      const imageBuffer = await axios.get<ArrayBuffer>(imageUrl, {
        responseType: "arraybuffer",
      });

      form.append("file", Buffer.from(imageBuffer.data as ArrayBuffer), {
        filename: "upload.jpg",
        contentType: image.mimetype,
      });

      const hfResponse = await axios.post<HFResponse>(HF_API_URL, form, {
        headers: form.getHeaders(),
      });

      const { label, confidence } = hfResponse.data;
      reply += `🔥 *Burn Degree:* ${label}\n📊 *Confidence:* ${confidence.toFixed(2)}%`;
    }

    if (message) {
      const openRouterResponse = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: message }],
        }),
      });

      const data: OpenRouterResponse = await openRouterResponse.json();
      const chatbotReply = data.choices?.[0]?.message?.content || "No reply from chatbot.";

      reply += imageUrl && message ? `\n\n💬 *Chatbot:* ${chatbotReply}` : chatbotReply;
    }

    await saveChatToDynamoDB(userId, message || "[Image only]", reply, imageUrl || undefined);
    await sendNotification(userId, "chat", "AI reply", reply);

    res.status(200).json({ reply, imageUrl });
  } catch (err: any) {
    console.error("🔥 Chatbot error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Something went wrong" });
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
    res.status(500).json({ error: "Unable to retrieve chat history" });
  }
};
