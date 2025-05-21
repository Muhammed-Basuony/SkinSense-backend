import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

interface S3File extends Express.Multer.File {
  location: string;
}

export const uploadProfilePic = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    const file = req.file as S3File;
    if (!email || !file) {
      res.status(400).json({ error: "Missing email or file" });
      return;
    }

    const photoUrl = file.location;
    
    res.status(200).json({ message: "Profile picture uploaded", photoUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload profile picture" });
  }
};

export const uploadSkinScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    const files = req.files as S3File[];
    if (!email || !files || files.length === 0) {
      res.status(400).json({ error: "Missing email or files" });
      return;
    }

    const scanUrls = files.map(f => f.location);
    
    res.status(200).json({ message: "Scans uploaded", scanUrls });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to upload scans" });
  }
};
