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
exports.verifyUsersExist = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";
/**
 * Verifies that all user IDs exist in the SkinSenseUsers table.
 */
const verifyUsersExist = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const keys = userIds.map((id) => ({ userId: { S: id } }));
    const command = new client_dynamodb_1.BatchGetItemCommand({
        RequestItems: {
            [USERS_TABLE]: {
                Keys: keys,
                ProjectionExpression: "userId",
            },
        },
    });
    const response = yield client.send(command);
    const foundUsers = ((_a = response.Responses) === null || _a === void 0 ? void 0 : _a[USERS_TABLE]) || [];
    return foundUsers.length === userIds.length;
});
exports.verifyUsersExist = verifyUsersExist;
