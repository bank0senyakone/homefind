import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import authRoutes from './routes/auth.routes.js';
// import dashboardRoutes from './routes/dashboard.routes.js';
// import roomRoutes from './routes/room.routes.js';
// import tenantRoutes from './routes/tenant.routes.js';
// import paymentRoutes from './routes/payment.routes.js';
// import checkInOutRoutes from './routes/checkInOut.routes.js';
// import issueRoutes from './routes/issue.routes.js';
// import reportRoutes from './routes/report.routes.js';
// import userRoutes from './routes/user.routes.js';
import routes from './routes/router.js'
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/rooms', roomRoutes);
// app.use('/api/tenants', tenantRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/checkin-out', checkInOutRoutes);
// app.use('/api/issues', issueRoutes);
// app.use('/api/reports', reportRoutes);
// app.use('/api/users', userRoutes);
app.use('/api', routes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});