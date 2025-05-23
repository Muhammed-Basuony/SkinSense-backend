import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import {
  getNotifications,
  markAsSeen,
} from "../controllers/notificationController";

const router = express.Router();

/**
 * @route GET /api/notifications
 * @desc Get all notifications for logged-in user
 * @access Protected
 */
router.get("/", authenticateToken, getNotifications);

/**
 * @route POST /api/notifications/mark-seen
 * @desc Mark a specific notification as seen
 * @access Protected
 */
router.post("/mark-seen", authenticateToken, markAsSeen);

export default router;
