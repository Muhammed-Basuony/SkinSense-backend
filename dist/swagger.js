"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SkinSense API",
            version: "1.0.0",
            description: "API documentation for the SkinSense backend",
        },
        servers: [
            {
                url: "http://51.20.133.238",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                UserProfile: {
                    type: "object",
                    properties: {
                        age: { type: "integer", example: 25 },
                        gender: { type: "string", example: "Male" },
                        bloodType: { type: "string", example: "O+" },
                        phone: { type: "string", example: "+201234567890" },
                        profilePhotoUrl: { type: "string", example: "https://example.com/photo.jpg" },
                        location: {
                            type: "object",
                            properties: {
                                latitude: { type: "number", example: 30.0444 },
                                longitude: { type: "number", example: 31.2357 },
                                address: { type: "string", example: "Cairo, Egypt" },
                            },
                        },
                    },
                },
                Notification: {
                    type: "object",
                    properties: {
                        userId: { type: "string", example: "user-123" },
                        notificationId: { type: "string", example: "notif-456" },
                        type: { type: "string", enum: ["chat", "article", "update"], example: "chat" },
                        title: { type: "string", example: "New reply from chatbot" },
                        message: { type: "string", example: "Here’s what I found for your skin scan." },
                        seen: { type: "boolean", example: false },
                        timestamp: { type: "string", format: "date-time", example: "2025-05-23T12:00:00Z" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/**/*.ts"], // keep this as is to auto-load route docs
};
const specs = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
};
exports.setupSwagger = setupSwagger;
