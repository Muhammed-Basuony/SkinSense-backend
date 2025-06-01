"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatbotController_1 = require("../controllers/chatbotController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const s3_1 = require("../utils/s3");
const router = express_1.default.Router();
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
 *             required: []
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
router.post("/chat", authMiddleware_1.authenticateToken, s3_1.s3Upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, chatbotController_1.askChatWithImage)(req, res);
}));
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
router.get("/history", authMiddleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, chatbotController_1.getChatHistory)(req, res);
}));
exports.default = router;
