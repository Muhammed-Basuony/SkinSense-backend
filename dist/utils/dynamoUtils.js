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
exports.getChatHistoryFromDynamoDB = exports.saveChatToDynamoDB = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const TABLE_NAME = "ChatHistory";
/**
 * Save a chat message to DynamoDB.
 * Supports optional imageUrl for image-based interactions.
 */
const saveChatToDynamoDB = (userId, question, reply, imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const timestamp = new Date().toISOString();
    const item = {
        userId: { S: userId },
        timestamp: { S: timestamp },
        question: { S: question },
        reply: { S: reply },
    };
    if (imageUrl) {
        item.imageUrl = { S: imageUrl };
    }
    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };
    yield client.send(new client_dynamodb_1.PutItemCommand(params));
});
exports.saveChatToDynamoDB = saveChatToDynamoDB;
/**
 * Retrieve chat history for a specific user.
 */
const getChatHistoryFromDynamoDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: {
            ":uid": { S: userId },
        },
    };
    const result = yield client.send(new client_dynamodb_1.QueryCommand(params));
    return ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.map((item) => (0, util_dynamodb_1.unmarshall)(item))) || [];
});
exports.getChatHistoryFromDynamoDB = getChatHistoryFromDynamoDB;
