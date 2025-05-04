import { Request, Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";
import { saveChatToDynamoDB, getChatHistoryFromDynamoDB } from "../utils/dynamoUtils";

const HF_API_KEY = process.env.HF_API_KEY || "";
const HF_MODEL = "HuggingFaceH4/zephyr-7b-beta";

export const askChatbot = async (req: AuthRequest, res: Response) => {
  const { message } = req.body;
  const userId = req.user?.userId;

  if (!message || !userId) {
    return res.status(400).json({ error: "Message and userId are required" });
  }

  try {
    if (message.startsWith("SCAN:")) {
      const scanData = message.replace("SCAN:", "").trim();
      await saveChatToDynamoDB(userId, "[Skin Scan]", scanData);
      return res.status(200).json({ reply: "Skin scan result saved successfully." });
    }

    const hfResponse = await axios.post(
      `https://api-inference.huggingface.co/models/${HF_MODEL}`,
      { inputs: message },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let reply = "No response.";
    const data = hfResponse.data;

    if (data && Array.isArray(data) && data[0]?.generated_text) {
      reply = data[0].generated_text;
    } else if (data && typeof data === "object" && "generated_text" in data) {
      reply = (data as { generated_text: string }).generated_text;
    }

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

