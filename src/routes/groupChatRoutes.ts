import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  startGroupChat,
  sendMessage,
  fetchMessages,
  listUserGroups,
  createCustomGroupChat,
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
 */
router.get("/messages/:chatId", authenticateToken, fetchMessages);

/**
 * @swagger
 * /api/group-chat/my-groups:
 *   get:
 *     summary: List group chats the current user belongs to
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of group chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       members:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get("/my-groups", authenticateToken, listUserGroups);

/**
 * @swagger
 * /api/group-chat/custom:
 *   post:
 *     summary: Create a custom group chat
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
 *               - members
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Eczema Discussion"
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user1", "user2"]
 *     responses:
 *       201:
 *         description: Group chat created successfully
 *       400:
 *         description: Invalid input or user not found
 */
router.post("/custom", authenticateToken, createCustomGroupChat);


export default router;
