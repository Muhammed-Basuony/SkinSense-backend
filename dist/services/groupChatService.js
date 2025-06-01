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
exports.verifyUsersExist = exports.getUserGroups = exports.getGroupById = exports.getChatMessages = exports.addMessageToChat = exports.createGroupChat = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const uuid_1 = require("uuid");
const dynamo = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const GROUP_CHATS_TABLE = "GroupChats";
const GROUP_MESSAGES_TABLE = "GroupMessages";
const USERS_TABLE = "SkinSenseUsers";
// Create a group chat
const createGroupChat = (group) => __awaiter(void 0, void 0, void 0, function* () {
    yield dynamo.send(new client_dynamodb_1.PutItemCommand({
        TableName: GROUP_CHATS_TABLE,
        Item: (0, util_dynamodb_1.marshall)(group),
    }));
    return group;
});
exports.createGroupChat = createGroupChat;
// Add a message to a chat with unique messageId
const addMessageToChat = (groupId, senderId, content) => __awaiter(void 0, void 0, void 0, function* () {
    const timestamp = new Date().toISOString();
    const message = {
        groupId,
        messageId: (0, uuid_1.v4)(),
        timestamp,
        senderId,
        content,
    };
    yield dynamo.send(new client_dynamodb_1.PutItemCommand({
        TableName: GROUP_MESSAGES_TABLE,
        Item: (0, util_dynamodb_1.marshall)(message),
    }));
    return message;
});
exports.addMessageToChat = addMessageToChat;
// Get messages for a group chat
const getChatMessages = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield dynamo.send(new client_dynamodb_1.QueryCommand({
        TableName: GROUP_MESSAGES_TABLE,
        KeyConditionExpression: "groupId = :groupId",
        ExpressionAttributeValues: {
            ":groupId": { S: groupId },
        },
        ScanIndexForward: true,
    }));
    return ((_a = result.Items) === null || _a === void 0 ? void 0 : _a.map(item => (0, util_dynamodb_1.unmarshall)(item))) || [];
});
exports.getChatMessages = getChatMessages;
// Get a group by ID
const getGroupById = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dynamo.send(new client_dynamodb_1.GetItemCommand({
        TableName: GROUP_CHATS_TABLE,
        Key: {
            groupId: { S: groupId },
        },
    }));
    return result.Item ? (0, util_dynamodb_1.unmarshall)(result.Item) : null;
});
exports.getGroupById = getGroupById;
// Get all groups that a user is a member of
const getUserGroups = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dynamo.send(new client_dynamodb_1.ScanCommand({
        TableName: GROUP_CHATS_TABLE,
    }));
    return (result.Items || [])
        .map(item => (0, util_dynamodb_1.unmarshall)(item))
        .filter(group => group.members.includes(userId));
});
exports.getUserGroups = getUserGroups;
// Verify if all given users exist
const verifyUsersExist = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const invalid = [];
    for (const userId of userIds) {
        const res = yield dynamo.send(new client_dynamodb_1.GetItemCommand({
            TableName: USERS_TABLE,
            Key: { userId: { S: userId } },
        }));
        if (!res.Item)
            invalid.push(userId);
    }
    return invalid;
});
exports.verifyUsersExist = verifyUsersExist;
