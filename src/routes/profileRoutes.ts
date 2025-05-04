import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getProfile, updateProfile } from "../controllers/profileController";

const router = express.Router();
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

export default router;
/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           example: user_abcd1234
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         age:
 *           type: number
 *           example: 28
 *         gender:
 *           type: string
 *           example: male
 *         bloodType:
 *           type: string
 *           example: O+
 *         phone:
 *           type: string
 *           example: "+201001234567"
 *         profilePhotoUrl:
 *           type: string
 *           example: https://example.com/photo.jpg
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               example: 30.0444
 *             longitude:
 *               type: number
 *               example: 31.2357
 *             address:
 *               type: string
 *               example: Giza, Egypt
 */

