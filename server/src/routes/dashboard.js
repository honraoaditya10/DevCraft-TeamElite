import express from 'express';
import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Document from '../models/Document.js';
import Activity from '../models/Activity.js';

const router = express.Router();

const buildDeadlineLabel = (date) =>
  date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });

const seedDataIfEmpty = async (userEmail) => {
  const schemeCount = await Scheme.countDocuments({ userEmail });
  const documentCount = await Document.countDocuments({ userEmail });
  const activityCount = await Activity.countDocuments({ userEmail });

  if (schemeCount === 0) {
    const now = new Date();
    const schemes = [
      {
        userEmail,
        name: 'Post-Matric Scholarship',
        description: 'Support for students in classes 11-12 and above.',
        deadlineDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'eligible'
      },
      {
        userEmail,
        name: 'Merit Scholarship 2025',
        description: 'Merit-based award for top academic performers.',
        deadlineDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
        status: 'eligible'
      },
      {
        userEmail,
        name: 'Minority Scheme',
        description: 'Support for eligible minority category applicants.',
        deadlineDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'needs_action',
        missingRequirement: 'Upload Income Certificate to apply.'
      }
    ].map((scheme) => ({
      ...scheme,
      deadlineLabel: buildDeadlineLabel(scheme.deadlineDate)
    }));

    await Scheme.insertMany(schemes);
  }

  if (documentCount === 0) {
    await Document.insertMany([
      { userEmail, label: 'Income Certificate', status: 'uploaded' },
      { userEmail, label: 'Caste Certificate', status: 'missing' },
      { userEmail, label: 'Aadhaar', status: 'verified' }
    ]);
  }

  if (activityCount === 0) {
    await Activity.insertMany([
      {
        userEmail,
        title: 'Eligibility checked',
        detail: 'You matched 3 schemes',
        timeLabel: 'Today, 9:00 AM'
      },
      {
        userEmail,
        title: 'Document uploaded',
        detail: 'Income Certificate added',
        timeLabel: 'Yesterday, 4:20 PM'
      },
      {
        userEmail,
        title: 'Scheme viewed',
        detail: 'Merit Scholarship 2025',
        timeLabel: '12 Feb, 11:15 AM'
      }
    ]);
  }
};

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
  const percent = Math.round((filled / fields.length) * 100);
  return percent;
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

    await seedDataIfEmpty(email);

    const schemes = await Scheme.find({ userEmail: email }).sort({ deadlineDate: 1 });
    const documents = await Document.find({ userEmail: email });
    const activities = await Activity.find({ userEmail: email }).sort({ createdAt: -1 });

    const eligibleSchemes = schemes.filter((scheme) => scheme.status === 'eligible');
    const needsAttention = schemes.filter((scheme) => scheme.status === 'needs_action');

    const now = new Date();
    const upcomingDeadlines = schemes.filter((scheme) => {
      const diff = scheme.deadlineDate.getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });

    const profileCompletion = computeProfileCompletion(user);

    const bannerCount = schemes.filter((scheme) => {
      const diff = now.getTime() - scheme.createdAt.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      stats: {
        eligibleSchemes: eligibleSchemes.length,
        needsAttention: needsAttention.length,
        upcomingDeadlines: upcomingDeadlines.length,
        profileCompletion
      },
      eligibleSchemes: eligibleSchemes.map((scheme) => ({
        id: scheme._id,
        name: scheme.name,
        description: scheme.description,
        deadline: scheme.deadlineLabel
      })),
      attention: needsAttention.map((scheme) => ({
        id: scheme._id,
        message: scheme.missingRequirement || 'Action needed to apply.',
        schemeName: scheme.name
      })),
      documents: documents.map((doc) => ({
        id: doc._id,
        label: doc.label,
        status: doc.status
      })),
      nextSteps: [
        { label: 'Complete Profile', done: profileCompletion >= 60 },
        { label: 'Upload Required Documents', done: documents.every((doc) => doc.status !== 'missing') },
        { label: 'Apply for Matching Scheme', done: eligibleSchemes.length > 0 },
        { label: 'Submit Before Deadline', done: upcomingDeadlines.length === 0 }
      ],
      banner: {
        message: `Based on your profile, you qualify for ${bannerCount} new schemes added this week.`,
        cta: 'Check Now'
      },
      timeline: activities.map((activity) => ({
        id: activity._id,
        title: activity.title,
        detail: activity.detail,
        time: activity.timeLabel
      }))
    });
  } catch (error) {
    console.error('Dashboard data error', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
