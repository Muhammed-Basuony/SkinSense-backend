"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorController_1 = require("../controllers/doctorController");
const router = express_1.default.Router();
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
router.get("/", doctorController_1.listDoctors);
/**
 * @swagger
 * /api/doctors/{id}/{name}:
 *   get:
 *     summary: Get full profile of a doctor by ID and Name
 *     tags: [Doctors]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor ID
 *       - name: name
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The doctor name (URL-encoded if it has spaces)
 *     responses:
 *       200:
 *         description: Doctor profile
 *       400:
 *         description: Missing id or name
 *       404:
 *         description: Doctor not found
 *       500:
 *         description: Server error
 */
router.get("/:id/:name", doctorController_1.getDoctorById);
exports.default = router;
