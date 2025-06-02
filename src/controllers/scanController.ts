import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendNotification } from "../utils/notificationUtils";
import { saveChatToDynamoDB } from "../utils/dynamoUtils";

const HF_API_URL = "https://mohmadessam-1-burn-classification.hf.space/predict";

interface S3File extends Express.Multer.File {
  location: string;
  mimetype: string;
}

interface BurnModelResponse {
  label: string;
  confidence: number;
}

export const uploadBurnScan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const file = req.file as S3File;

  if (!userId || !file) {
    res.status(400).json({ error: "Missing user or file" });
    return;
  }

  try {
    // Download image from S3
    const imageStream = await axios.get(file.location, {
      responseType: "arraybuffer",
    });

    const form = new FormData();
    form.append("file", Buffer.from(imageStream.data as ArrayBuffer), {
      filename: "burn_scan.jpg",
      contentType: file.mimetype,
    });

    // Cast response data to the correct type
    const result = await axios.post<BurnModelResponse>(HF_API_URL, form, {
      headers: form.getHeaders(),
    });

    const { label, confidence } = result.data;

    const reply = `🔥 *Burn Degree:* ${label}\n📊 *Confidence:* ${confidence.toFixed(2)}%`;

    // Save to ChatHistory table
    await saveChatToDynamoDB(userId, "[Burn Scan Image]", reply, file.location);

    // Notify user
    await sendNotification(userId, "chat", "Burn scan result", reply);

    res.status(200).json({ message: "Scan successful", label, confidence, imageUrl: file.location });
  } catch (error: any) {
    console.error("Scan error:", error?.message || error);
    res.status(500).json({ error: "Failed to analyze burn scan" });
  }
};

