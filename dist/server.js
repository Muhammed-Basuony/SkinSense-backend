"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const chatbotRoutes_1 = __importDefault(require("./routes/chatbotRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const groupChatRoutes_1 = __importDefault(require("./routes/groupChatRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const swagger_1 = require("./swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '5000', 10);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
(0, swagger_1.setupSwagger)(app);
app.use("/api/group-chat", groupChatRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.use("/api/chatbot", chatbotRoutes_1.default);
app.use("/api/profile", profileRoutes_1.default);
app.use("/api/doctors", doctorRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use('*', (req, res) => {
    console.warn(`Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Requested resource not found' });
});
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
