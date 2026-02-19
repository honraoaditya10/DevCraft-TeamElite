import express from 'express';
import User from '../models/User.js';
import AdminScheme from '../models/AdminScheme.js';

const router = express.Router();

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

const checkUserEligibility = (user, scheme) => {
  if (!scheme.conditions || scheme.conditions.length === 0) {
    return { isEligible: true, missing: [], score: 100 };
  }

  let matchedConditions = 0;
  const totalConditions = scheme.conditions.length;
  const missing = [];

  // Check each condition group
  const allGroupsPassed = scheme.conditions.every((group) => {
    const groupPassed = group.joiner === 'OR'
      ? group.rows.some((condition) => evaluateCondition(user, condition))
      : group.rows.every((condition) => evaluateCondition(user, condition));

    if (groupPassed) matchedConditions++;
    else {
      // Collect missing requirements
      group.rows.forEach((condition) => {
        if (!evaluateCondition(user, condition)) {
          missing.push(`${condition.field} ${condition.operator} ${condition.value}`);
        }
      });
    }

    return groupPassed;
  });

  const score = Math.round((matchedConditions / totalConditions) * 100);

  return {
    isEligible: allGroupsPassed,
    missing: [...new Set(missing)],
    score
  };
};

/**
 * GET /api/v2/eligibility/:userId
 * Get eligibility results for a user against all schemes
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user by ID or email
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all schemes
    const schemes = await AdminScheme.find().lean();

    const eligible_schemes = [];
    const partial_match_schemes = [];
    const not_eligible_schemes = [];

    // Check eligibility for each scheme
    for (const scheme of schemes) {
      const eligibility = checkUserEligibility(user, scheme);
      
      const schemeData = {
        id: scheme._id,
        name: scheme.name,
        scheme_name: scheme.name,
        description: scheme.description,
        score: eligibility.score,
        reason: eligibility.isEligible 
          ? 'You meet all eligibility criteria'
          : eligibility.score > 50
            ? 'You partially meet the eligibility criteria'
            : 'You do not meet the eligibility criteria',
        missing: eligibility.missing
      };

      if (eligibility.isEligible) {
        eligible_schemes.push(schemeData);
      } else if (eligibility.score > 50) {
        partial_match_schemes.push(schemeData);
      } else {
        not_eligible_schemes.push(schemeData);
      }
    }

    const response = {
      eligible_count: eligible_schemes.length,
      partial_count: partial_match_schemes.length,
      not_eligible_count: not_eligible_schemes.length,
      eligible_schemes,
      partial_match_schemes,
      not_eligible_schemes
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching eligibility results:', error);
    res.status(500).json({
      message: 'Failed to fetch eligibility results',
      error: error.message
    });
  }
});

export default router;
