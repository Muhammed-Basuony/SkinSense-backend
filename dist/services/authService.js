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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const emailService_1 = require("../utils/emailService");
const User_models_1 = require("../models/User.models");
dotenv_1.default.config();
const dynamo = new client_dynamodb_1.DynamoDBClient({ region: "eu-north-1" });
const USERS_TABLE = "SkinSenseUsers";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret";
class AuthService {
    signup(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password } = data;
            const existing = yield this.getUserByEmail(email);
            if (existing)
                throw new Error("User already exists");
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const userId = (0, User_models_1.generateUserId)();
            const newUser = {
                userId,
                name,
                email,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
                age: null,
                gender: null,
                bloodType: null,
                phone: null,
                photoUrl: null,
                location: null,
            };
            const putCommand = new client_dynamodb_1.PutItemCommand({
                TableName: USERS_TABLE,
                Item: {
                    userId: { S: newUser.userId },
                    name: { S: newUser.name },
                    email: { S: newUser.email },
                    password: { S: newUser.password },
                    createdAt: { S: newUser.createdAt },
                    age: { NULL: true },
                    gender: { NULL: true },
                    bloodType: { NULL: true },
                    phone: { NULL: true },
                    photoUrl: { NULL: true },
                    location: { NULL: true },
                },
            });
            yield dynamo.send(putCommand);
            const token = jsonwebtoken_1.default.sign({ userId, email }, JWT_SECRET, { expiresIn: "2h" });
            return {
                token,
                userId: newUser.userId,
                email: newUser.email,
                name: newUser.name,
                age: null,
                gender: null,
                bloodType: null,
                phone: null,
                photoUrl: null,
                location: {
                    latitude: null,
                    longitude: null,
                    address: null,
                },
            };
        });
    }
    login(data) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = data;
            const user = yield this.getUserByEmail(email);
            if (!user)
                throw new Error("Invalid email or password");
            const valid = yield bcryptjs_1.default.compare(password, user.password);
            if (!valid)
                throw new Error("Invalid email or password");
            const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
            return {
                token,
                userId: user.userId,
                email: user.email,
                name: (_a = user.name) !== null && _a !== void 0 ? _a : null,
                age: (_b = user.age) !== null && _b !== void 0 ? _b : null,
                gender: (_c = user.gender) !== null && _c !== void 0 ? _c : null,
                bloodType: (_d = user.bloodType) !== null && _d !== void 0 ? _d : null,
                phone: (_e = user.phone) !== null && _e !== void 0 ? _e : null,
                photoUrl: (_f = user.photoUrl) !== null && _f !== void 0 ? _f : null,
                location: (_g = user.location) !== null && _g !== void 0 ? _g : {
                    latitude: null,
                    longitude: null,
                    address: null,
                },
            };
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.getUserByEmail(email);
            if (!user)
                throw new Error("User not found");
            const token = jsonwebtoken_1.default.sign({ userId: user.userId, email: user.email }, JWT_SECRET, {
                expiresIn: "15m",
            });
            yield (0, emailService_1.sendResetEmail)(email, token);
            return "Reset password link sent to your email";
        });
    }
    resetPassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, token, newPassword } = data;
            let decoded;
            try {
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                if (decoded.email !== email)
                    throw new Error("Token does not match the provided email");
            }
            catch (err) {
                if (err.name === "TokenExpiredError") {
                    throw new Error("Reset token has expired. Please request a new one.");
                }
                throw new Error("Invalid or expired token.");
            }
            const user = yield this.getUserByEmail(email);
            if (!user)
                throw new Error("User not found");
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            const updateCommand = new client_dynamodb_1.PutItemCommand({
                TableName: USERS_TABLE,
                Item: {
                    userId: { S: user.userId },
                    name: { S: user.name },
                    email: { S: user.email },
                    password: { S: hashedPassword },
                    createdAt: { S: user.createdAt },
                    age: user.age ? { N: user.age.toString() } : { NULL: true },
                    gender: user.gender ? { S: user.gender } : { NULL: true },
                    bloodType: user.bloodType ? { S: user.bloodType } : { NULL: true },
                    phone: user.phone ? { S: user.phone } : { NULL: true },
                    photoUrl: user.photoUrl ? { S: user.photoUrl } : { NULL: true },
                    location: user.location ? { S: JSON.stringify(user.location) } : { NULL: true },
                },
            });
            yield dynamo.send(updateCommand);
            return { userId: user.userId, email: user.email };
        });
    }
    getUserByEmail(email) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function* () {
            const getCommand = new client_dynamodb_1.GetItemCommand({
                TableName: USERS_TABLE,
                Key: {
                    email: { S: email },
                },
            });
            const response = yield dynamo.send(getCommand);
            if (!response.Item)
                return null;
            return {
                userId: response.Item.userId.S,
                name: response.Item.name.S,
                email: response.Item.email.S,
                password: response.Item.password.S,
                createdAt: response.Item.createdAt.S,
                age: ((_a = response.Item.age) === null || _a === void 0 ? void 0 : _a.N) ? parseInt(response.Item.age.N) : null,
                gender: (_c = (_b = response.Item.gender) === null || _b === void 0 ? void 0 : _b.S) !== null && _c !== void 0 ? _c : null,
                bloodType: (_e = (_d = response.Item.bloodType) === null || _d === void 0 ? void 0 : _d.S) !== null && _e !== void 0 ? _e : null,
                phone: (_g = (_f = response.Item.phone) === null || _f === void 0 ? void 0 : _f.S) !== null && _g !== void 0 ? _g : null,
                photoUrl: (_j = (_h = response.Item.photoUrl) === null || _h === void 0 ? void 0 : _h.S) !== null && _j !== void 0 ? _j : null,
                location: ((_k = response.Item.location) === null || _k === void 0 ? void 0 : _k.S) ? JSON.parse(response.Item.location.S) : {
                    latitude: null,
                    longitude: null,
                    address: null,
                },
            };
        });
    }
}
exports.AuthService = AuthService;
