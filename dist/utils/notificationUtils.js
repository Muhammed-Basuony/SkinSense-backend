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
exports.sendNotification = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const uuid_1 = require("uuid");
const client = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const NOTIFICATIONS_TABLE = "SkinSenseNotifications";
/**
 * Sends a new notification to a user.
 */
const sendNotification = (userId, type, title, message) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new client_dynamodb_1.PutItemCommand({
        TableName: NOTIFICATIONS_TABLE,
        Item: {
            userId: { S: userId },
            notificationId: { S: (0, uuid_1.v4)() },
            type: { S: type },
            title: { S: title },
            message: { S: message },
            seen: { BOOL: false },
            timestamp: { S: new Date().toISOString() },
        },
    });
    yield client.send(command);
});
exports.sendNotification = sendNotification;
