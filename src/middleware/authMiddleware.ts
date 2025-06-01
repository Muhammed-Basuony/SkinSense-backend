import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: {
    email: string;
    userId: string;
  };
  file?: Express.Multer.File;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    const decoded = jwt.verify(token, secret) as { email: string; userId: string };

    req.user = {
      email: decoded.email,
      userId: decoded.userId,
    };

    next();
  } catch (err: any) {
    console.error('Token validation failed:', err.message);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
