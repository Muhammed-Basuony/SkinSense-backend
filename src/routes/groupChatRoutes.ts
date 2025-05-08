import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  startGroupChat,
  sendMessage,
  fetchMessages,
} from "../controllers/groupChatController";

const router = express.Router();

/**
 * @swagger
 * /api/group-chat/create:
 *   post:
 *     summary: Create a new group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user1", "user2"]
 *     responses:
 *       201:
 *         description: Group chat created successfully
 *       400:
 *         description: Participants are required
 */
router.post("/create", authenticateToken, startGroupChat);

/**
 * @swagger
 * /api/group-chat/send:
 *   post:
 *     summary: Send a message to a group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chatId:
 *                 type: string
 *                 example: "chat123"
 *               text:
 *                 type: string
 *                 example: "Hello everyone!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing chatId or message text
 */
router.post("/send", authenticateToken, sendMessage);

/**
 * @swagger
 * /api/group-chat/messages/{chatId}:
 *   get:
 *     summary: Fetch messages for a group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the group chat
 *     responses:
 *       200:
 *         description: List of messages
 *       500:
 *         description: Server error
 */
router.get("/messages/:chatId", authenticateToken, fetchMessages);

export default router;
