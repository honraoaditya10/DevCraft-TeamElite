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

    console.log(`Found ${adminSchemes.length} published admin schemes for user ${email}`);

    // Check eligibility for each scheme
    const adminSchemesWithEligibility = adminSchemes.map(scheme => ({
      scheme,
      eligible: checkUserEligibility(user, scheme)
    }));

    // Fetch old schemes (for backwards compatibility)
    const oldSchemes = await Scheme.find({ userEmail: email }).sort({ deadlineDate: 1 });
    
    const documents = await Document.find({ userEmail: email });
    const activities = await Activity.find({ userEmail: email }).sort({ createdAt: -1 });

    const eligibleOldSchemes = oldSchemes.filter((scheme) => scheme.status === 'eligible');
    const needsAttention = oldSchemes.filter((scheme) => scheme.status === 'needs_action');

    // Combine ALL schemes (both eligible and ineligible from admin, plus old schemes)
    const allSchemes = [
      ...adminSchemesWithEligibility.map(({ scheme, eligible }) => ({
        id: scheme._id,
        name: scheme.schemeName,
        description: scheme.description || `${scheme.schemeType} by ${scheme.department}`,
        deadline: scheme.deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        department: scheme.department,
        eligible: eligible,
        type: 'admin'
      })),
      ...eligibleOldSchemes.map((scheme) => ({
        id: scheme._id,
        name: scheme.name,
        description: scheme.description,
        deadline: scheme.deadlineLabel,
        eligible: true,
        type: 'old'
      }))
    ];

    console.log(`Total schemes to show user: ${allSchemes.length}, Eligible: ${allSchemes.filter(s => s.eligible).length}`);

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
        eligibleSchemes: allSchemes.filter(s => s.eligible).length,
        totalSchemes: allSchemes.length,
        needsAttention: needsAttention.length,
        upcomingDeadlines: upcomingDeadlines.length,
        profileCompletion
      },
      eligibleSchemes: allSchemes,
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
        { label: 'Apply for Matching Scheme', done: allSchemes.length > 0 },
        { label: 'Submit Before Deadline', done: upcomingDeadlines.length === 0 }
      ],
      banner: {
        message: `You have access to ${allSchemes.length} schemes${recentSchemes.length > 0 ? `, including ${recentSchemes.length} added this week` : ''}. ${allSchemes.filter(s => s.eligible).length} match your profile.`,
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

// Get scheme details with eligibility check
router.get('/scheme/:schemeId', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    const { schemeId } = req.params;

    if (!email || !schemeId) {
      return res.status(400).json({ message: 'Email and scheme ID are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Try to get from AdminScheme first
    let scheme = await AdminScheme.findById(schemeId);
    
    if (!scheme) {
      // Fall back to old Scheme model
      scheme = await Scheme.findById(schemeId);
      if (!scheme) {
        return res.status(404).json({ message: 'Scheme not found' });
      }
      
      // Return old scheme format
      return res.json({
        scheme: {
          id: scheme._id,
          schemeName: scheme.name,
          description: scheme.description,
          department: 'Unknown',
          schemeType: 'Scholarship',
          region: 'Central (All India)',
          deadline: scheme.deadlineLabel,
          requiredDocs: {}
        },
        eligibility: {
          eligible: scheme.status === 'eligible',
          reasons: []
        }
      });
    }

    // Check eligibility for admin scheme
    const eligible = checkUserEligibility(user, scheme);
    const reasons = getEligibilityReasons(user, scheme);

    return res.json({
      scheme: {
        id: scheme._id,
        schemeName: scheme.schemeName,
        description: scheme.description,
        department: scheme.department,
        schemeType: scheme.schemeType,
        region: scheme.region,
        deadline: scheme.deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        requiredDocs: scheme.requiredDocs,
        website: scheme.website
      },
      eligibility: {
        eligible,
        reasons
      }
    });
  } catch (error) {
    console.error('Get scheme error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Helper to get detailed eligibility reasons
const getEligibilityReasons = (user, scheme) => {
  if (!scheme.conditions || scheme.conditions.length === 0) {
    return [];
  }

  const reasons = [];
  
  scheme.conditions.forEach((group) => {
    group.rows.forEach((row) => {
      const { field, operator, value } = row;
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
      const met = evaluateCondition(user, row);

      let message = '';
      if (userValue === undefined || userValue === null) {
        message = `Please provide your ${field.toLowerCase()}`;
      } else {
        switch (operator) {
          case 'Equals':
            message = `${field} must be ${value}. You have: ${userValue}`;
            break;
          case 'Not Equals':
            message = `${field} must not be ${value}. You have: ${userValue}`;
            break;
          case 'Less Than':
            message = `${field} must be less than ${value}. You have: ${userValue}`;
            break;
          case 'Greater Than':
            message = `${field} must be greater than ${value}. You have: ${userValue}`;
            break;
          case 'Between':
            message = `${field} must be between ${value}. You have: ${userValue}`;
            break;
          case 'Includes':
            message = `${field} must include ${value}. You have: ${userValue}`;
            break;
          default:
            message = `${field} ${operator} ${value}`;
        }
      }

      reasons.push({
        field,
        message,
        met
      });
    });
  });

  return reasons;
};

export default router;
