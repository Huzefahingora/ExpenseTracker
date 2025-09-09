import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
