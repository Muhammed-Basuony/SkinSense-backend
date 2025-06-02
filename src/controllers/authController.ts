import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import logger from '../utils/logger';
import { addUserToDefaultGroups } from '../utils/addUserToDefaultGroups';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await authService.signup(req.body);
      const email = result.email;
      if (!email) return res.status(500).json({ error: "Signup succeeded but email missing." });

      await addUserToDefaultGroups(email);
      logger.info(`New user signed up and assigned to groups: ${email}`);
      return res.status(201).json({ message: 'User created', result });
    } catch (error: any) {
      logger.error(`Signup Error: ${error.message}`);
      return res.status(500).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body);
      logger.info(`User logged in: ${result.email}`);
      return res.status(200).json({ message: 'Login successful', result });
    } catch (error: any) {
      logger.warn(`Login failed: ${error.message}`);
      return res.status(401).json({ error: error.message });
    }
  }

  async sendResetCode(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const message = await authService.sendResetCode(email);
      logger.info(`Reset code sent to: ${email}`);
      return res.status(200).json({ message });
    } catch (error: any) {
      logger.error(`Send Reset Code Error: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }

  async verifyResetCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

      const valid = await authService.verifyResetCode(email, code);
      return res.status(200).json({ message: 'Code is valid', valid });
    } catch (error: any) {
      logger.warn(`Code verification failed: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, code, newPassword, confirmPassword } = req.body;

      if (!email || !code || !newPassword || !confirmPassword)
        return res.status(400).json({ error: 'All fields are required' });

      if (newPassword !== confirmPassword)
        return res.status(400).json({ error: 'Passwords do not match' });

      const result = await authService.resetPasswordWithCode({ email, code, newPassword });
      logger.info(`Password reset for user: ${email}`);
      return res.status(200).json({ message: 'Password reset successful', result });
    } catch (error: any) {
      logger.error(`Reset Password Error: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }
}
