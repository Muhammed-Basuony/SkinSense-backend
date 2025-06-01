import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  createCustomGroupChat,
  sendMessage,
  fetchMessages,
  getMyGroups,
} from "../controllers/groupChatController";



const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Group Chat
 *   description: Group chat operations for SkinSense users
 */

/**
 * @swagger
 * /api/group-chat/create:
 *   post:
 *     summary: Create a new custom group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - memberIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acne Help Group"
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user123", "user456"]
 *     responses:
 *       201:
 *         description: Group chat created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/create", authenticateToken, createCustomGroupChat);

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
 *             required:
 *               - chatId
 *               - text
 *             properties:
 *               chatId:
 *                 type: string
 *                 example: "group-123"
 *               text:
 *                 type: string
 *                 example: "Hello group!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post("/send", authenticateToken, sendMessage);

/**
 * @swagger
 * /api/group-chat/messages/{chatId}:
 *   get:
 *     summary: Fetch messages from a specific group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: chatId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group chat
 *     responses:
 *       200:
 *         description: List of messages
 *       400:
 *         description: Invalid chat ID
 *       500:
 *         description: Server error
 */
router.get("/messages/:chatId", authenticateToken, fetchMessages);

/**
 * @swagger
 * /api/group-chat/my-groups:
 *   get:
 *     summary: Get all group chats the user is a member of
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user’s group chats
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/my-groups", authenticateToken, getMyGroups); 


export default router;
