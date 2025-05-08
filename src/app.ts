import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import AuthRoutes from './routes/authRoutes';
import { setupSwagger } from './swagger';
import logger from './utils/logger';
import ChatbotRoutes from "./routes/chatbotRoutes";
import profileRoutes from "./routes/profileRoutes";
import groupChatRoutes from "./routes/groupChatRoutes";
import doctorRoutes from "./routes/doctorRoutes";



dotenv.config();

const app = express();
app.use(express.json());


app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use("/api/group-chat", groupChatRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/chatbot', ChatbotRoutes); 
app.use("/api/profile", profileRoutes);
app.use("/api/doctors", doctorRoutes);



setupSwagger(app);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to SkinSense Backend API');
});


app.use((req: Request, res: Response) => {
  logger.warn(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Requested resource not found' });
});

export default app;

