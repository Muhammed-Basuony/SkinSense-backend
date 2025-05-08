import express from "express";
import { listDoctors, getDoctorById } from "../controllers/doctorController";

const router = express.Router();

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get list of all doctors
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: List of doctors
 *       500:
 *         description: Server error
 */
router.get("/", listDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get full profile of a doctor by ID
 *     tags: [Doctors]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID
 *     responses:
 *       200:
 *         description: Doctor profile
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getDoctorById);

export default router;
