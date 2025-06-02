import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { uploadBurnScan } from "../controllers/scanController";
import { s3Uploader } from "../middleware/multerS3Config";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Burn Scan
 *   description: Upload burn scan and receive model output
 */

/**
 * @swagger
 * /api/scan/upload:
 *   post:
 *     summary: Upload a burn scan and receive burn degree classification
 *     tags: [Burn Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Burn scan analysis completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: https://s3.amazonaws.com/scan.jpg
 *                 label:
 *                   type: string
 *                   example: First Degree Burn
 *                 confidence:
 *                   type: number
 *                   example: 91.52
 *       400:
 *         description: Missing file or user ID
 *       500:
 *         description: Failed to analyze burn scan
 */
router.post(
  "/upload",
  authenticateToken,
  s3Uploader.single("file"), 
  uploadBurnScan
);

export default router;