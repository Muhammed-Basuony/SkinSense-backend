import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUserByEmail, updateUserProfile } from "../utils/userUtils";

interface S3File extends Express.Multer.File {
  location: string;
}

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
   if (!email) {
   res.status(400).json({ error: "Missing user context" });
   return;
   }


    const user = await getUserByEmail(email);
    if (!user)
      { res.status(404).json({ error: "User not found" });
    return;
  }


    const { password: _, ...profileWithoutPassword } = user;
    res.status(200).json({ profile: profileWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    const updates = req.body;
    if (!email) {
  res.status(400).json({ error: "Missing user context" });
  return;
}
const updated = await updateUserProfile(email, updates);


    res.status(200).json({ message: "Profile updated", profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
};

export const updateProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    const file = req.file as S3File;
    if (!email || !file) {
      res.status(400).json({ error: "Missing email or photo" });
      return;
    }

    const photoUrl = file.location;
    const updated = await updateUserProfile(email, { photoUrl });

    res.status(200).json({
      message: "Photo updated",
      photoUrl,
      profile: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Upload failed" });
  }
};
