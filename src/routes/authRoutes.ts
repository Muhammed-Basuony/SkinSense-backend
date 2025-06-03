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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     age:
 *                       type: number
 *                       nullable: true
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                     bloodType:
 *                       type: string
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           nullable: true
 *                         longitude:
 *                           type: number
 *                           nullable: true
 *                         address:
 *                           type: string
 *                           nullable: true
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     age:
 *                       type: number
 *                       nullable: true
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                     bloodType:
 *                       type: string
 *                       nullable: true
 *                     phone:
 *                       type: string
 *                       nullable: true
 *                     photoUrl:
 *                       type: string
 *                       nullable: true
 *                     location:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           nullable: true
 *                         longitude:
 *                           type: number
 *                           nullable: true
 *                         address:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidation, handleValidation, (req: Request, res: Response) => {
  authController.login(req, res);
});

/**
 * @swagger
 * /api/auth/send-reset-code:
 *   post:
 *     summary: Send 4-digit password reset code to user's email
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
 *         description: Code sent
 *       400:
 *         description: Error
 */
router.post('/send-reset-code', (req: Request, res: Response) => {
  authController.sendResetCode(req, res);
});

/**
 * @swagger
 * /api/auth/verify-reset-code:
 *   post:
 *     summary: Verify 4-digit code for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code is valid
 *       400:
 *         description: Invalid or expired code
 */
router.post('/verify-reset-code', (req: Request, res: Response) => {
  authController.verifyResetCode(req, res);
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password after code verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Error or mismatch
 */

router.post('/reset-password', resetPasswordValidation, handleValidation, (req: Request, res: Response) => {
  authController.resetPassword(req, res);
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
