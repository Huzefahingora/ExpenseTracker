import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenseRoutes.js';
import authRoutes from './routes/authRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies

// ---------------- Swagger Setup ----------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Expense Tracker API",
      version: "1.0.0",
      description: "API documentation for Expense Tracker (Auth + Expenses)",
    },
    servers: [
      {
        url: "https://studious-lamp-7qrvvwg5x4634pv-5000.app.github.dev",
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.js")], // absolute path
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ------------------------------------------------

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
