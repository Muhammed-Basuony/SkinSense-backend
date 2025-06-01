"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUserId = void 0;
const generateUserId = () => {
    return `user_${Math.random().toString(36).substring(2, 10)}`;
};
exports.generateUserId = generateUserId;
