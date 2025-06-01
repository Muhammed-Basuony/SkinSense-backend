"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1];
    if (!token) {
        console.warn("No token provided");
        res.status(401).json({ error: "No token provided" });
        return;
    }
    try {
        const secret = process.env.JWT_SECRET || "your-secret";
        console.log("JWT_SECRET being used:", secret);
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        console.log("Token decoded:", decoded);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error("Token validation failed:", err.message);
        res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.authenticateToken = authenticateToken;
