import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

import authRoutes from './components/routes/authRoutes';
import tripRoutes from './components/routes/tripRoutes';

// Basic Route
app.get('/', (req, res) => {
  res.send('Trao AI Travel Planner API is running');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
