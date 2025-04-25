import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import scanRoutes from "./routes/scanRoutes";

const PORT = process.env.PORT || 5000;

app.use("/api/skin", scanRoutes);
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
