import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import adminRouter from './routes/admin.js';
import eligibilityRouter from './routes/eligibility.js';
import chatbotRouter from './routes/chatbot.js';
import { connectToDatabase } from './db.js';
import User from './models/User.js';

dotenv.config();

/* =========================
   Configuration
========================= */
const {
  PORT = 5000,
  CORS_ORIGIN = 'http://localhost:5173',
  ADMIN_EMAIL = 'admin@gmail.com',
  ADMIN_PASSWORD = 'Admin@123',
  NODE_ENV = 'development'
} = process.env;

const app = express();

/* =========================
   Middleware
========================= */

// Allow multiple origins via env (comma separated)
const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS not allowed for origin: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Routes
========================= */

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: NODE_ENV
  });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);
app.use('/api/v2/eligibility', eligibilityRouter);
app.use('/api/chatbot', chatbotRouter);

/* =========================
   Admin Seeder
========================= */

const seedAdminUser = async () => {
  try {
    const email = ADMIN_EMAIL.toLowerCase();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✔ Existing user promoted to admin');
      }
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      fullName: 'Admin User',
      email,
      passwordHash,
      role: 'admin'
    });

    console.log('✔ Admin user seeded successfully');
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message);
    process.exit(1);
  }
};

/* =========================
   Global Error Handler
========================= */

app.use((err, _req, res, _next) => {
  console.error(err.stack);

  res.status(500).json({
    message: 'Internal Server Error',
    ...(NODE_ENV === 'development' && { error: err.message })
  });
});

/* =========================
   Start Server
========================= */

const startServer = async () => {
  try {
    await connectToDatabase();
    console.log('✔ MongoDB connected');

    await seedAdminUser();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.close(() => {
        console.log('✔ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
