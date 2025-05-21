import express from 'express';
import { s3Uploader } from '../middleware/multerS3Config';
import { uploadProfilePic, uploadSkinScan } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/upload/profile', authenticateToken, s3Uploader.single('profile'), uploadProfilePic);
router.post('/upload/scan', authenticateToken, s3Uploader.array('scans', 5), uploadSkinScan);

export default router;
