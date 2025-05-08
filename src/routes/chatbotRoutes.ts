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
 * /api/chat:
 *   post:
 *     summary: Ask the chatbot a dermatology-related question
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
 *                 description: The question or message to send to the chatbot
 *                 example: "What should I do about dry skin?"
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
 *                   example: "You should use a moisturizer with hyaluronic acid twice a day."
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
 *     summary: Retrieve the user's chatbot interaction history
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
 *                         example: "user123"
 *                       question:
 *                         type: string
 *                         example: "What can I use for oily skin?"
 *                       reply:
 *                         type: string
 *                         example: "Use a gentle foaming cleanser twice a day."
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-08T18:25:00.000Z"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve chat history
 */
router.get("/chatbot/history", authenticateToken, async (req: AuthRequest, res: Response) => {
  await getChatHistory(req, res);
});
export default router;
