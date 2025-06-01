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
exports.markAsSeen = exports.getNotifications = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const NOTIFICATIONS_TABLE = "SkinSenseNotifications";
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ error: "Missing user ID" });
            return;
        }
        const result = yield client.send(new client_dynamodb_1.QueryCommand({
            TableName: NOTIFICATIONS_TABLE,
            KeyConditionExpression: "userId = :uid",
            ExpressionAttributeValues: { ":uid": { S: userId } },
        }));
        const notifications = ((_b = result.Items) === null || _b === void 0 ? void 0 : _b.map(item => (0, util_dynamodb_1.unmarshall)(item))) || [];
        res.status(200).json({ notifications });
    }
    catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});
exports.getNotifications = getNotifications;
const markAsSeen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId;
        const { notificationId } = req.body;
        if (!userId || !notificationId) {
            res.status(400).json({ error: "Missing user ID or notification ID" });
            return;
        }
        yield client.send(new client_dynamodb_1.UpdateItemCommand({
            TableName: NOTIFICATIONS_TABLE,
            Key: {
                userId: { S: userId },
                notificationId: { S: notificationId },
            },
            UpdateExpression: "SET seen = :s",
            ExpressionAttributeValues: {
                ":s": { BOOL: true },
            },
        }));
        res.status(200).json({ message: "Notification marked as seen" });
    }
    catch (err) {
        console.error("Error marking notification as seen:", err);
        res.status(500).json({ error: "Failed to update notification" });
    }
});
exports.markAsSeen = markAsSeen;
