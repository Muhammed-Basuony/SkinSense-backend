import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3Uploader = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET!,
    acl: 'public-read',
    metadata: (_req: Request, file: Express.Multer.File, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (_req: Request, file: Express.Multer.File, cb) => {
      cb(null, `profile-photos/${Date.now()}-${file.originalname}`);
    },
  }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

export { s3Uploader };
