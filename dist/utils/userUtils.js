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
exports.updateUserProfile = exports.getUserByEmail = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const dynamo = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const cmd = new client_dynamodb_1.GetItemCommand({
        TableName: USERS_TABLE,
        Key: { email: { S: email } },
    });
    const res = yield dynamo.send(cmd);
    return res.Item ? (0, util_dynamodb_1.unmarshall)(res.Item) : null;
});
exports.getUserByEmail = getUserByEmail;
const updateUserProfile = (email, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield (0, exports.getUserByEmail)(email);
    if (!existing)
        throw new Error("User not found");
    const mergedUser = Object.assign(Object.assign({}, existing), updates);
    const cleanedUser = {};
    Object.keys(mergedUser).forEach((key) => {
        const value = mergedUser[key];
        if (value !== undefined && value !== null) {
            cleanedUser[key] = value;
        }
    });
    const putCmd = new client_dynamodb_1.PutItemCommand({
        TableName: USERS_TABLE,
        Item: (0, util_dynamodb_1.marshall)(cleanedUser),
    });
    yield dynamo.send(putCmd);
    return cleanedUser;
});
exports.updateUserProfile = updateUserProfile;
