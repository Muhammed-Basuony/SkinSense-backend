import express, { Request, Response } from "express";
import { askChatbot, getChatHistory } from "../controllers/chatbotController";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Interact with the SkinSense chatbot
 */

/**
 * @swagger
 * /api/chatbot/chat:
 *   post:
 *     summary: Send a message to the chatbot
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What should I do for dry skin?"
 *     responses:
 *       200:
 *         description: Chatbot replied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "Use a gentle moisturizer twice a day."
 *       400:
 *         description: Message or user ID missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post("/chat", authenticateToken, async (req: AuthRequest, res: Response) => {
  await askChatbot(req, res);
});

/**
 * @swagger
 * /api/chatbot/history:
 *   get:
 *     summary: Retrieve chatbot conversation history
 *     tags: [Chatbot]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of previous chatbot messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       question:
 *                         type: string
 *                       reply:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve chat history
 */

router.get("/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  await getChatHistory(req, res);
});
export default router;
