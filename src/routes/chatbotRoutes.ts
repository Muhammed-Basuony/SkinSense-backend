import express, { Request, Response } from "express";
import { askChatWithImage, getChatHistory } from "../controllers/chatbotController";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { s3Upload } from "../utils/s3";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Interact with SkinSense Chatbot or Burn Scan AI
 */

/**
 * @swagger
 * /api/chatbot/chat:
 *   post:
 *     summary: Send a text message and/or image to the chatbot or burn model
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What cream should I use for burns?"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Chatbot or model reply
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *       400:
 *         description: Input missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  "/chat",
  authenticateToken,
  s3Upload.single("image"),
  async (req: AuthRequest, res: Response) => {
    await askChatWithImage(req, res);
  }
);

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Retrieve user chatbot history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of messages and replies
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Error fetching history
 */
router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  await getChatHistory(req, res);
});

export default router;
