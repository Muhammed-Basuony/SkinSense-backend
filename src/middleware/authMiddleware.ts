
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    console.warn("No token provided");
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret";
    console.log("JWT_SECRET being used:", secret);
    const decoded = jwt.verify(token, secret);
    console.log("Token decoded:", decoded);
    req.user = decoded;
    next();
  } catch (err: any) {
    console.error("Token validation failed:", err.message);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

