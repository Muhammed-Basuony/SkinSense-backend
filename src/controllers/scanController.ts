import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendNotification } from "../utils/notificationUtils";
import { saveChatToDynamoDB } from "../utils/dynamoUtils";
import axios from "axios";
import FormData from "form-data";

interface S3File extends Express.Multer.File {
  location: string;
  mimetype: string;
}

export const scanBurnImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const image = req.file as S3File;

  if (!userId || !image || !image.location) {
    res.status(400).json({ error: "User or image is missing" });
    return;
  }

  try {
    const form = new FormData();

    // Download image from S3 to buffer
    const imageResponse = await axios.get<ArrayBuffer>(image.location, {
      responseType: "arraybuffer",
    });

    form.append("file", Buffer.from(imageResponse.data), {
      filename: "burn_scan.jpg",
      contentType: image.mimetype,
    });

    const result = await axios.post("https://mohmadessam-1-burn-classification.hf.space/predict", form, {
      headers: form.getHeaders(),
    });

    const label = (result.data as any).class_name;
    const confidence = (result.data as any).confidence;

    const reply = `🔥 *Burn Degree:* ${label}\n📊 *Confidence:* ${confidence.toFixed(2)}%`;

    await saveChatToDynamoDB(userId, "[Burn Scan]", reply, image.location);

    await sendNotification(
      userId,
      "scan",
      "Burn scan result ready",
      reply
    );

    res.status(200).json({ message: "Scan complete", label, confidence, imageUrl: image.location });
  } catch (err: any) {
    console.error("Scan error:", err.message);
    res.status(500).json({ error: "Burn scan failed" });
  }
};
