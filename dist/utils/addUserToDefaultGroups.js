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
exports.addUserToDefaultGroups = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const dynamo = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const GROUP_CHATS_TABLE = "GroupChats";
const DEFAULT_GROUP_NAMES = [
    "First Burn Degree",
    "Second Burn Degree",
    "Third Burn Degree",
];
const getGroupByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const command = new client_dynamodb_1.ScanCommand({
        TableName: GROUP_CHATS_TABLE,
        FilterExpression: "#name = :n",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":n": { S: name } },
    });
    const result = yield dynamo.send(command);
    return (_a = result.Items) === null || _a === void 0 ? void 0 : _a[0];
});
const addUserToDefaultGroups = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    for (const groupName of DEFAULT_GROUP_NAMES) {
        const groupRaw = yield getGroupByName(groupName);
        if (!groupRaw) {
            console.warn(`⚠️ Group '${groupName}' not found`);
            continue;
        }
        const group = (0, util_dynamodb_1.unmarshall)(groupRaw);
        const members = group.members || [];
        if (!members.includes(userId)) {
            members.push(userId);
            group.members = members;
            yield dynamo.send(new client_dynamodb_1.PutItemCommand({
                TableName: GROUP_CHATS_TABLE,
                Item: (0, util_dynamodb_1.marshall)(group),
            }));
            console.log(`✅ Added ${userId} to ${groupName}`);
        }
    }
});
exports.addUserToDefaultGroups = addUserToDefaultGroups;
