import express, { Request, Response } from "express";
import { askChatbot, getChatHistory } from "../controllers/chatbotController";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Ask the chatbot a question
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: What should I do about dry skin?
 *     responses:
 *       200:
 *         description: Chatbot reply
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/chat", authenticateToken, async (req: AuthRequest, res: Response) => {
  await askChatbot(req, res);
});

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Get user chatbot interaction history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of previous messages
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/chatbot/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  await getChatHistory(req, res);
});

export default router;
