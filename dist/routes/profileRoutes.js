"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const profileController_1 = require("../controllers/profileController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: User Profile
 *   description: User profile management
 */
// ==========================
// Multer config for photo upload
// ==========================
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/profile_photos");
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const name = `photo-${Date.now()}${ext}`;
        cb(null, name);
    },
});
const upload = (0, multer_1.default)({ storage });
/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized or token missing
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware_1.authenticateToken, profileController_1.getProfile);
/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 profile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/", authMiddleware_1.authenticateToken, profileController_1.updateProfile);
/**
 * @swagger
 * /api/profile/upload-photo:
 *   post:
 *     summary: Upload user profile photo
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded and saved
 *       400:
 *         description: No photo uploaded
 *       500:
 *         description: Server error
 */
router.post("/upload-photo", authMiddleware_1.authenticateToken, upload.single("photo"), profileController_1.updateProfilePhoto);
exports.default = router;
