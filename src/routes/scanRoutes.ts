import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { uploadBurnScan } from "../controllers/scanController";
import { s3Upload } from "../utils/s3";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Burn Scan
 *   description: Upload burn scan image and receive AI classification
 */

/**
 * @swagger
 * /api/scan/upload:
 *   post:
 *     summary: Upload a burn scan image and receive burn degree classification
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
 *                 description: The image file of the burn to be scanned
 *     responses:
 *       200:
 *         description: Burn degree classified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Scan successful"
 *                 label:
 *                   type: string
 *                   example: "First Degree Burn"
 *                 confidence:
 *                   type: number
 *                   example: 94.52
 *                 imageUrl:
 *                   type: string
 *                   example: "https://your-s3-bucket.amazonaws.com/burn-scan.jpg"
 *       400:
 *         description: Missing user or file
 *       500:
 *         description: Failed to analyze burn scan
 */
router.post(
  "/upload",
  authenticateToken,
  s3Upload.single("file"),
  uploadBurnScan
);

export default router;
