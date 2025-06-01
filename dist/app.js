"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const swagger_1 = require("./swagger");
const logger_1 = __importDefault(require("./utils/logger"));
const chatbotRoutes_1 = __importDefault(require("./routes/chatbotRoutes"));
const profileRoutes_1 = __importDefault(require("./routes/profileRoutes"));
const groupChatRoutes_1 = __importDefault(require("./routes/groupChatRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, morgan_1.default)('combined', {
    stream: {
        write: (message) => logger_1.default.info(message.trim()),
    },
}));
app.use("/api/group-chat", groupChatRoutes_1.default);
app.use('/api/auth', authRoutes_1.default);
app.use('/api/chatbot', chatbotRoutes_1.default);
app.use("/api/profile", profileRoutes_1.default);
app.use("/api/doctors", doctorRoutes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
app.use((0, cors_1.default)());
(0, swagger_1.setupSwagger)(app);
app.get('/', (req, res) => {
    res.send('Welcome to SkinSense Backend API');
});
app.use((req, res) => {
    logger_1.default.warn(`Unmatched route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Requested resource not found' });
});
exports.default = app;
