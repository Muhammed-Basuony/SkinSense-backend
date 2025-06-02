"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const groupChatController_1 = require("../controllers/groupChatController");
const router = express_1.default.Router();
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
 *                 example: ["user1@example.com", "user2@example.com"]
 *     responses:
 *       201:
 *         description: Group chat created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/create", authMiddleware_1.authenticateToken, groupChatController_1.createCustomGroupChat);
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
 *               - groupId
 *               - text
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: "group-uuid-123"
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
router.post("/send", authMiddleware_1.authenticateToken, groupChatController_1.sendMessage);
/**
 * @swagger
 * /api/group-chat/messages/{groupId}:
 *   get:
 *     summary: Fetch messages from a specific group chat
 *     tags: [Group Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the group chat
 *     responses:
 *       200:
 *         description: List of messages
 *       400:
 *         description: Invalid group ID
 *       500:
 *         description: Server error
 */
router.get("/messages/:groupId", authMiddleware_1.authenticateToken, groupChatController_1.fetchMessages);
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
router.get("/my-groups", authMiddleware_1.authenticateToken, groupChatController_1.getMyGroups);
exports.default = router;
