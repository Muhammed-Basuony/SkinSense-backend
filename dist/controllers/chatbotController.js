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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatHistory = exports.askChatWithImage = exports.askChatbot = void 0;
const dynamoUtils_1 = require("../utils/dynamoUtils");
const notificationUtils_1 = require("../utils/notificationUtils");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openai/gpt-4o-mini";
const askChatbot = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { message } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!message || !userId) {
        res.status(400).json({ error: "Message and userId are required" });
        return;
    }
    try {
        const response = yield fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
            }),
        });
        const data = yield response.json();
        const reply = ((_d = (_c = (_b = data.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || "No reply from chatbot.";
        yield (0, dynamoUtils_1.saveChatToDynamoDB)(userId, message, reply);
        yield (0, notificationUtils_1.sendNotification)(userId, "chat", "New reply from chatbot", reply);
        res.status(200).json({ reply });
    }
    catch (err) {
        console.error("Chatbot error:", ((_e = err === null || err === void 0 ? void 0 : err.response) === null || _e === void 0 ? void 0 : _e.data) || err.message);
        res
            .status(500)
            .json({ error: "Something went wrong with the chatbot" });
    }
});
exports.askChatbot = askChatbot;
const askChatWithImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h, _j;
    const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f.userId;
    const { message } = req.body;
    const image = req.file;
    if (!userId || (!message && !image)) {
        res
            .status(400)
            .json({ error: "Either message or image is required." });
        return;
    }
    try {
        const imageUrl = image ? image.location : null;
        const prompt = message || "Please analyze the uploaded image.";
        const response = yield fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            }),
        });
        const data = yield response.json();
        const reply = ((_j = (_h = (_g = data.choices) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.message) === null || _j === void 0 ? void 0 : _j.content) || "No reply from chatbot.";
        yield (0, dynamoUtils_1.saveChatToDynamoDB)(userId, message || "[Image only]", reply, imageUrl);
        yield (0, notificationUtils_1.sendNotification)(userId, "chat", "New reply from chatbot", `${message || "[Image only]"}\n\n${reply}${imageUrl ? `\n\nImage: ${imageUrl}` : ""}`);
        res.status(200).json({ reply, imageUrl });
    }
    catch (err) {
        console.error("Chatbot image chat error:", err.message);
        res.status(500).json({ error: "Failed to chat with AI" });
    }
});
exports.askChatWithImage = askChatWithImage;
const getChatHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    const userId = (_k = req.user) === null || _k === void 0 ? void 0 : _k.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const history = yield (0, dynamoUtils_1.getChatHistoryFromDynamoDB)(userId);
        res.status(200).json({ history });
    }
    catch (err) {
        console.error("Fetch history error:", err.message);
        res
            .status(500)
            .json({ error: "Unable to retrieve chat history" });
    }
});
exports.getChatHistory = getChatHistory;
