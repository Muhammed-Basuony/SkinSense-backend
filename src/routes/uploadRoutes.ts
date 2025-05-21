// src/routes/uploadRoutes.ts
import express from 'express';
import { s3Uploader } from '../middleware/multerS3Config';
import { uploadProfilePic, uploadSkinScan } from '../controllers/uploadController';

const router = express.Router();

router.post('/upload/profile', s3Uploader.single('profile'), uploadProfilePic);
router.post('/upload/scan', s3Uploader.array('scans', 5), uploadSkinScan);

export default router;
