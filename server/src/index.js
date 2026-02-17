import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import authRouter from './routes/auth.js';
import dashboardRouter from './routes/dashboard.js';
import { connectToDatabase } from './db.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

const seedAdminUser = async () => {
  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
    }
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    fullName: 'Admin User',
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: 'admin'
  });
};

connectToDatabase()
  .then(async () => {
    await seedAdminUser();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  });
