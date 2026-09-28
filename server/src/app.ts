import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import routesRoutes from './routes/routes.routes.js';
import operationsRoutes from './routes/operations.routes.js';
import workOrdersRoutes from './routes/work-orders.routes.js';
import complaintsRoutes from './routes/complaints.routes.js';
import vehiclesRoutes from './routes/vehicles.routes.js';
import binsRoutes from './routes/bins.routes.js';

import './models/index.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: env.NODE_ENV });
});

import dashboardRoutes from './routes/dashboard.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/operations', operationsRoutes);
app.use('/api/work-orders', workOrdersRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/bins', binsRoutes);

app.use(errorHandler);

export { app };
