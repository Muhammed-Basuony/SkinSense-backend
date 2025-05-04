import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import logger from '../utils/logger'; 

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const result = await authService.signup(req.body);
      logger.info(`New user signed up: ${result.email}`);
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

  async forgotPassword(email: string) {
    return await authService.forgotPassword(email);
  }
  

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, token, newPassword, confirmPassword } = req.body;
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }
  
      const result = await authService.resetPassword({ email, token, newPassword });
      return res.status(200).json({ message: "Password reset successful", result });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  
}

