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
exports.ProfileService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client = new client_dynamodb_1.DynamoDBClient({ region: process.env.AWS_REGION });
const USERS_TABLE = "SkinSenseUsers";
class ProfileService {
    getProfile(userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_dynamodb_1.GetItemCommand({
                TableName: USERS_TABLE,
                Key: {
                    userId: { S: userId },
                },
            });
            const result = yield client.send(command);
            if (!result.Item)
                throw new Error("User not found");
            return {
                name: ((_a = result.Item.name) === null || _a === void 0 ? void 0 : _a.S) || null,
                email: ((_b = result.Item.email) === null || _b === void 0 ? void 0 : _b.S) || null,
                age: ((_c = result.Item.age) === null || _c === void 0 ? void 0 : _c.N) ? Number(result.Item.age.N) : null,
                gender: ((_d = result.Item.gender) === null || _d === void 0 ? void 0 : _d.S) || null,
                bloodType: ((_e = result.Item.bloodType) === null || _e === void 0 ? void 0 : _e.S) || null,
                phone: ((_f = result.Item.phone) === null || _f === void 0 ? void 0 : _f.S) || null,
                photoUrl: ((_g = result.Item.photoUrl) === null || _g === void 0 ? void 0 : _g.S) || null,
                location: result.Item.latitude && result.Item.longitude ? {
                    latitude: parseFloat(result.Item.latitude.N),
                    longitude: parseFloat(result.Item.longitude.N),
                    address: ((_h = result.Item.address) === null || _h === void 0 ? void 0 : _h.S) || null,
                } : null,
            };
        });
    }
    updateProfile(userId, data) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = {};
            const updateExpressions = [];
            if (data.age !== undefined) {
                attributes[":age"] = { N: data.age.toString() };
                updateExpressions.push("age = :age");
            }
            if (data.gender !== undefined) {
                attributes[":gender"] = { S: data.gender };
                updateExpressions.push("gender = :gender");
            }
            if (data.bloodType !== undefined) {
                attributes[":bloodType"] = { S: data.bloodType };
                updateExpressions.push("bloodType = :bloodType");
            }
            if (data.phone !== undefined) {
                attributes[":phone"] = { S: data.phone };
                updateExpressions.push("phone = :phone");
            }
            if (data.photoUrl !== undefined) {
                attributes[":photoUrl"] = { S: data.photoUrl };
                updateExpressions.push("photoUrl = :photoUrl");
            }
            if (((_a = data.location) === null || _a === void 0 ? void 0 : _a.latitude) !== undefined && ((_b = data.location) === null || _b === void 0 ? void 0 : _b.longitude) !== undefined) {
                attributes[":latitude"] = { N: data.location.latitude.toString() };
                attributes[":longitude"] = { N: data.location.longitude.toString() };
                updateExpressions.push("latitude = :latitude", "longitude = :longitude");
                if (data.location.address !== undefined) {
                    attributes[":address"] = { S: data.location.address };
                    updateExpressions.push("address = :address");
                }
            }
            const updateCommand = new client_dynamodb_1.UpdateItemCommand({
                TableName: USERS_TABLE,
                Key: { userId: { S: userId } },
                UpdateExpression: `SET ${updateExpressions.join(", ")}`,
                ExpressionAttributeValues: attributes,
            });
            yield client.send(updateCommand);
            return { success: true };
        });
    }
}
exports.ProfileService = ProfileService;
