
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import app from './app';

import authRoutes from './routes/authRoutes';
import chatbotRoutes from './routes/chatbotRoutes';



const PORT = process.env.PORT || 5000;


app.use('/api/auth', authRoutes);
app.use('/api', chatbotRoutes);

app.use('*', (req, res) => {
  console.warn(`Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Requested resource not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
