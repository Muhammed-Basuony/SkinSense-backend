// src/routes/scanRoutes.ts

import express from "express";
import { SkinScanService } from "../services/skinScanService";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
import { analyzeSkin } from "../services/aiService";

const router = express.Router();
const scanService = new SkinScanService();

/**
 * @swagger
 * /api/skin/scan:
 *   post:
 *     summary: Save a skin scan for a user
 *     tags: [Skin Scans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the scanned skin image
 *     responses:
 *       201:
 *         description: Scan saved successfully
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.post("/scan", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.userId;
    const { imageUrl } = req.body;

    const aiResult = await analyzeSkin(imageUrl);

    const scanData = {
      imageUrl,
      diagnosis: aiResult.diagnosis,
      confidence: aiResult.confidence,
      recommendations: aiResult.recommendations,
      scannedAt: new Date().toISOString(),
    };

    const result = await scanService.saveScan(userId, scanData);
    res.status(201).json(result);
  } catch (error: any) {
    console.error("❌ Scan Route Error:", error);
    res.status(500).json({ error: error.message || "Scan failed" });
  }
});

/**
 * @swagger
 * /api/skin/scans:
 *   get:
 *     summary: Get all scans for the logged-in user
 *     tags: [Skin Scans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   scanId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                   diagnosis:
 *                     type: string
 *                   confidence:
 *                     type: number
 *                   recommendations:
 *                     type: string
 *                   scannedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/scans", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.userId;
    const scans = await scanService.getScans(userId);
    res.json(scans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
