import express from 'express';
import User from '../models/User.js';

const router = express.Router();

const computeProfileCompletion = (user) => {
  const fields = [
    user?.fullName,
    user?.email,
    user?.role,
    user?.dateOfBirth,
    user?.state,
    user?.district
  ];
  const filled = fields.filter((value) => Boolean(value && String(value).trim())).length;
  return Math.round((filled / fields.length) * 100);
};

router.get('/', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profileCompletion = computeProfileCompletion(user);

    return res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth || '',
        state: user.state || '',
        district: user.district || ''
      },
      profileCompletion
    });
  } catch (error) {
    console.error('Profile fetch error', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { email, fullName, dateOfBirth, state, district } = req.body;
    const normalizedEmail = (email || '').toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (typeof fullName === 'string') user.fullName = fullName.trim();
    if (typeof dateOfBirth === 'string') user.dateOfBirth = dateOfBirth.trim();
    if (typeof state === 'string') user.state = state.trim();
    if (typeof district === 'string') user.district = district.trim();

    await user.save();

    const profileCompletion = computeProfileCompletion(user);

    return res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        dateOfBirth: user.dateOfBirth || '',
        state: user.state || '',
        district: user.district || ''
      },
      profileCompletion
    });
  } catch (error) {
    console.error('Profile update error', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
