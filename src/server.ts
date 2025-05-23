import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import app from './app';

import authRoutes from './routes/authRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import profileRoutes from './routes/profileRoutes';
import { setupSwagger } from './swagger';
import groupChatRoutes from "./routes/groupChatRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import notificationRoutes from "./routes/notificationRoutes";

const PORT = parseInt(process.env.PORT || '5000', 10);



app.use("/api/group-chat", groupChatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/notifications", notificationRoutes);


setupSwagger(app);


app.use('*', (req, res) => {
  console.warn(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Requested resource not found' });
});

app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
