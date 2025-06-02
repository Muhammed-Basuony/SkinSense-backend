import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getProfile, updateProfile, updateProfilePhoto } from "../controllers/profileController";
import { s3Uploader } from "../middleware/multerS3Config";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized or token missing
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, getProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/", authenticateToken, updateProfile);

/**
 * @swagger
 * /api/profile/upload-photo:
 *   post:
 *     summary: Upload user profile photo to S3 and update profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded and saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Photo updated
 *                 photoUrl:
 *                   type: string
 *                   example: https://bucket-name.s3.amazonaws.com/photo.jpg
 *       400:
 *         description: Missing email or photo
 *       500:
 *         description: Upload failed
 */
router.post("/upload-photo", authenticateToken, s3Uploader.single("photo"), updateProfilePhoto);

export default router;
