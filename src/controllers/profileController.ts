import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUserByEmail, updateUserProfile } from "../utils/userUtils";

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user.email;
    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password: _, ...profileWithoutPassword } = user;
    res.json({ profile: profileWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user.email;
    const updates = req.body;

    const updated = await updateUserProfile(email, updates);
    res.json({ message: "Profile updated successfully", profile: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
};
