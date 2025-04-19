import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import AuthRoutes from './routes/authRoutes';
import ScanRoutes from './routes/scanRoutes';
import { setupSwagger } from './swagger';
import logger from './utils/logger';
import ChatbotRoutes from "./routes/chatbotRoutes";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Morgan logging to Winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// ✅ Mount routes
app.use('/api/auth', AuthRoutes);
app.use('/api/skin', ScanRoutes);
app.use('/api/chatbot', ChatbotRoutes); // 👈 Move this here!

// ✅ Swagger setup
setupSwagger(app);

// ✅ Root route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to SkinSense Backend API');
});

// ✅ 404 handler (last)
app.use((req: Request, res: Response) => {
  logger.warn(`❌ Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Requested resource not found' });
});

export default app;

