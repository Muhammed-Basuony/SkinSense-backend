import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUserByEmail, updateUserProfile } from "../utils/userUtils";

/**
 * Get the authenticated user's profile (excluding password)
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    if (!email) {
      res.status(400).json({ error: "Missing user context" });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const { password: _, ...profileWithoutPassword } = user;
    res.status(200).json({ profile: profileWithoutPassword });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

/**
 * Update the authenticated user's profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    if (!email) {
      res.status(400).json({ error: "Missing user context" });
      return;
    }

    const updates = req.body;
    const updated = await updateUserProfile(email, updates);

    res.status(200).json({ message: "Profile updated successfully", profile: updated });
  } catch (err: any) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: err.message || "Failed to update profile" });
  }
};

/**
 * Upload and update the user's profile photo
 */
export const updateProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const email = req.user?.email;
    if (!email) {
      res.status(400).json({ error: "Missing user context" });
      return;
    }

    const file = req.file as Express.Multer.File;
    if (!file) {
      res.status(400).json({ error: "No photo uploaded" });
      return;
    }

    
    const photoUrl = file.location;


    const updated = await updateUserProfile(email, { photoUrl });

    res.status(200).json({
      message: "Photo uploaded successfully",
      photoUrl,
      profile: updated,
    });
  } catch (err: any) {
    console.error("Error uploading profile photo:", err);
    res.status(500).json({ error: err.message || "Failed to upload profile photo" });
  }
};
