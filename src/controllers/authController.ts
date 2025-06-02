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
      if (!email) {
        return res.status(500).json({ error: "Signup succeeded but email missing from result." });
      }

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

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      const message = await authService.forgotPassword(email);
      logger.info(`Password reset link sent to: ${email}`);
      return res.status(200).json({ message });
    } catch (error: any) {
      logger.error(`Forgot Password Error: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, token, newPassword, confirmPassword } = req.body;

      if (!email || !token || !newPassword || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
      }

      const result = await authService.resetPassword({ email, token, newPassword });
      logger.info(`Password reset for user: ${email}`);
      return res.status(200).json({ message: 'Password reset successful', result });
    } catch (error: any) {
      logger.error(`Reset Password Error: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
  }
}
