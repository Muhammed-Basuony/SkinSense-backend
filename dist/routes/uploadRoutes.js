"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multerS3Config_1 = require("../middleware/multerS3Config");
const uploadController_1 = require("../controllers/uploadController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post('/upload/profile', authMiddleware_1.authenticateToken, multerS3Config_1.s3Uploader.single('profile'), uploadController_1.uploadProfilePic);
router.post('/upload/scan', authMiddleware_1.authenticateToken, multerS3Config_1.s3Uploader.array('scans', 5), uploadController_1.uploadSkinScan);
exports.default = router;
