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
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const logger_1 = __importDefault(require("../utils/logger"));
const addUserToDefaultGroups_1 = require("../utils/addUserToDefaultGroups");
const authService = new authService_1.AuthService();
class AuthController {
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield authService.signup(req.body);
                const userId = result.userId || result.email;
                yield (0, addUserToDefaultGroups_1.addUserToDefaultGroups)(userId);
                logger_1.default.info(`New user signed up: ${userId}`);
                return res.status(201).json({ message: 'User created', result });
            }
            catch (error) {
                logger_1.default.error(`Signup Error: ${error.message}`);
                return res.status(500).json({ error: error.message });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield authService.login(req.body);
                logger_1.default.info(`User logged in: ${result.email}`);
                return res.status(200).json({ message: 'Login successful', result });
            }
            catch (error) {
                logger_1.default.warn(`Login failed: ${error.message}`);
                return res.status(401).json({ error: error.message });
            }
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email)
                    return res.status(400).json({ error: 'Email is required' });
                const message = yield authService.forgotPassword(email);
                logger_1.default.info(`Password reset link sent to: ${email}`);
                return res.status(200).json({ message });
            }
            catch (error) {
                logger_1.default.error(`Forgot Password Error: ${error.message}`);
                return res.status(400).json({ error: error.message });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, token, newPassword, confirmPassword } = req.body;
                if (!email || !token || !newPassword || !confirmPassword) {
                    return res.status(400).json({ error: 'All fields are required' });
                }
                if (newPassword !== confirmPassword) {
                    return res.status(400).json({ error: 'Passwords do not match' });
                }
                const result = yield authService.resetPassword({ email, token, newPassword });
                logger_1.default.info(`Password reset for user: ${email}`);
                return res.status(200).json({ message: 'Password reset successful', result });
            }
            catch (error) {
                logger_1.default.error(`Reset Password Error: ${error.message}`);
                return res.status(400).json({ error: error.message });
            }
        });
    }
}
exports.AuthController = AuthController;
