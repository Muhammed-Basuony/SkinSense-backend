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
exports.getMyGroups = exports.fetchMessages = exports.sendMessage = exports.createCustomGroupChat = void 0;
const uuid_1 = require("uuid");
const groupChatService_1 = require("../services/groupChatService");
const notificationUtils_1 = require("../utils/notificationUtils");
const createCustomGroupChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const creatorEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
    const { name, memberIds } = req.body;
    if (!creatorEmail || !name || !memberIds || !Array.isArray(memberIds)) {
        res.status(400).json({ error: 'Group name and memberIds are required.' });
        return;
    }
    const uniqueMembers = [...new Set([creatorEmail, ...memberIds])];
    try {
        const invalidUsers = yield (0, groupChatService_1.verifyUsersExist)(uniqueMembers);
        if (invalidUsers.length > 0) {
            res.status(400).json({ error: `Invalid users: ${invalidUsers.join(', ')}` });
            return;
        }
        const group = {
            groupId: (0, uuid_1.v4)(),
            name,
            members: uniqueMembers,
            createdAt: new Date().toISOString(),
        };
        const result = yield (0, groupChatService_1.createGroupChat)(group);
        res.status(201).json({ message: 'Group chat created', group: result });
    }
    catch (err) {
        console.error('Create group error:', err);
        res.status(500).json({ error: 'Failed to create group.' });
    }
});
exports.createCustomGroupChat = createCustomGroupChat;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const senderEmail = (_b = req.user) === null || _b === void 0 ? void 0 : _b.email;
    const { groupId, text } = req.body;
    if (!senderEmail || !groupId || !text) {
        res.status(400).json({ error: 'groupId and text are required.' });
        return;
    }
    try {
        const group = yield (0, groupChatService_1.getGroupById)(groupId);
        if (!group)
            throw new Error('Group not found');
        const message = yield (0, groupChatService_1.addMessageToChat)(groupId, senderEmail, text);
        const recipients = group.members.filter((email) => email !== senderEmail);
        yield Promise.all(recipients.map((userEmail) => (0, notificationUtils_1.sendNotification)(userEmail, 'chat', 'New group message', `New message in ${group.name}`)));
        res.status(200).json({ message: 'Message sent', data: message });
    }
    catch (err) {
        console.error('Send message error:', err);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});
exports.sendMessage = sendMessage;
const fetchMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chatId } = req.params;
    if (!chatId) {
        res.status(400).json({ error: 'chatId required' });
        return;
    }
    try {
        const messages = yield (0, groupChatService_1.getChatMessages)(chatId);
        res.status(200).json({ messages });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages.' });
    }
});
exports.fetchMessages = fetchMessages;
const getMyGroups = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const email = (_c = req.user) === null || _c === void 0 ? void 0 : _c.email;
    if (!email) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const groups = yield (0, groupChatService_1.getUserGroups)(email);
        res.status(200).json({ groups });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch groups.' });
    }
});
exports.getMyGroups = getMyGroups;
