// src/routes/authRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import {
  signupValidation,
  loginValidation,
  resetPasswordValidation,
} from '../middleware/validationMiddleware';
import { validationResult } from 'express-validator';

const router = express.Router();
const authController = new AuthController();

const handleValidation = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/signup', signupValidation, handleValidation, (req: Request, res: Response) => {
  authController.signup(req, res);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, handleValidation, (req: Request, res: Response) => {
  authController.login(req, res);
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password for a user using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or user not found
 */
router.post('/reset-password', resetPasswordValidation, handleValidation, (req: Request, res: Response) => {
  authController.resetPassword(req, res);
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset email to user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password email sent
 *       400:
 *         description: User not found or email error
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const message = await authController.forgotPassword(email);
    res.status(200).json({ message });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/protected:
 *   get:
 *     summary: Access a protected route (requires token)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authorized access
 *       401:
 *         description: Unauthorized
 */
router.get('/protected', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    message: 'You are authorized!',
    user: req.user,
  });
});

export default router;
