import express from 'express';
import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import AdminScheme from '../models/AdminScheme.js';
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

// Check if user matches scheme eligibility conditions
const checkUserEligibility = (user, scheme) => {
  if (!scheme.conditions || scheme.conditions.length === 0) {
    return true; // No conditions means everyone is eligible
  }

  // All condition groups must pass (AND between groups)
  return scheme.conditions.every((group) => {
    // At least one condition in the group must pass (based on joiner)
    if (group.joiner === 'OR') {
      return group.rows.some((condition) => evaluateCondition(user, condition));
    } else {
      // AND - all conditions must pass
      return group.rows.every((condition) => evaluateCondition(user, condition));
    }
  });
};

const evaluateCondition = (user, condition) => {
  const { field, operator, value } = condition;
  
  // Map condition fields to user properties
  const fieldMap = {
    'Annual Income': user.annualIncome,
    'Category': user.category,
    'Education Level': user.educationLevel,
    'Gender': user.gender,
    'State': user.state,
    'Minority Status': user.minorityStatus,
    'Disability Status': user.disabilityStatus,
    'Institution Type': user.institutionType,
    'Marks Percentage': user.marksPercentage,
    'Age': user.age || calculateAge(user.dateOfBirth)
  };

  const userValue = fieldMap[field];
  
  // If user doesn't have the field, consider ineligible
  if (userValue === undefined || userValue === null) {
    return false;
  }

  switch (operator) {
    case 'Equals':
      return String(userValue).toLowerCase() === String(value).toLowerCase();
    case 'Not Equals':
      return String(userValue).toLowerCase() !== String(value).toLowerCase();
    case 'Less Than':
      return Number(userValue) < Number(value);
    case 'Greater Than':
      return Number(userValue) > Number(value);
    case 'Between':
      const [min, max] = String(value).split('-').map(Number);
      return Number(userValue) >= min && Number(userValue) <= max;
    case 'Includes':
      return String(userValue).toLowerCase().includes(String(value).toLowerCase());
    default:
      return false;
  }
};

const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
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

    // Seed old scheme data if empty (for backwards compatibility)
    await seedDataIfEmpty(email);

    // Fetch published schemes from AdminScheme
    const adminSchemes = await AdminScheme.find({ 
      status: 'Published',
      deadline: { $gte: new Date() } // Only active schemes
    }).sort({ deadline: 1 });

    // Filter schemes user is eligible for
    const eligibleAdminSchemes = adminSchemes.filter(scheme => checkUserEligibility(user, scheme));

    // Fetch old schemes (for backwards compatibility)
    const oldSchemes = await Scheme.find({ userEmail: email }).sort({ deadlineDate: 1 });
    
    const documents = await Document.find({ userEmail: email });
    const activities = await Activity.find({ userEmail: email }).sort({ createdAt: -1 });

    const eligibleOldSchemes = oldSchemes.filter((scheme) => scheme.status === 'eligible');
    const needsAttention = oldSchemes.filter((scheme) => scheme.status === 'needs_action');

    // Combine eligible schemes
    const allEligibleSchemes = [
      ...eligibleAdminSchemes.map(scheme => ({
        id: scheme._id,
        name: scheme.schemeName,
        description: scheme.description || `${scheme.schemeType} by ${scheme.department}`,
        deadline: scheme.deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        department: scheme.department,
        type: 'admin'
      })),
      ...eligibleOldSchemes.map((scheme) => ({
        id: scheme._id,
        name: scheme.name,
        description: scheme.description,
        deadline: scheme.deadlineLabel,
        type: 'old'
      }))
    ];

    const now = new Date();
    const upcomingDeadlines = [...adminSchemes, ...oldSchemes].filter((scheme) => {
      const deadlineDate = scheme.deadline || scheme.deadlineDate;
      if (!deadlineDate) return false;
      const diff = new Date(deadlineDate).getTime() - now.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });

    const profileCompletion = computeProfileCompletion(user);

    const recentSchemes = adminSchemes.filter((scheme) => {
      const diff = now.getTime() - scheme.createdAt.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    });

    return res.json({
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      stats: {
        eligibleSchemes: allEligibleSchemes.length,
        needsAttention: needsAttention.length,
        upcomingDeadlines: upcomingDeadlines.length,
        profileCompletion
      },
      eligibleSchemes: allEligibleSchemes,
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
        { label: 'Apply for Matching Scheme', done: allEligibleSchemes.length > 0 },
        { label: 'Submit Before Deadline', done: upcomingDeadlines.length === 0 }
      ],
      banner: {
        message: `Based on your profile, you qualify for ${allEligibleSchemes.length} schemes${recentSchemes.length > 0 ? `, including ${recentSchemes.length} added this week` : ''}.`,
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
