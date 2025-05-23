import express, { Request, Response } from "express";
import { askChatWithImage, getChatHistory } from "../controllers/chatbotController";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { s3Upload } from "../utils/s3"; 

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
 *     summary: Send a message or image to the chatbot
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
 *                 example: "What should I do for dry skin?"
 *               image:
 *                 type: string
 *                 format: binary
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
 *                 imageUrl:
 *                   type: string
 *                   example: "https://your-s3-bucket-url.amazonaws.com/chatbot-images/image123.png"
 *       400:
 *         description: Input missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/chat", authenticateToken, s3Upload.single("image"), async (req: AuthRequest, res: Response) => {
  await askChatWithImage(req, res);
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
 *                       imageUrl:
 *                         type: string
 *                         example: "https://your-s3-bucket-url.amazonaws.com/chatbot-images/abc.jpg"
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
