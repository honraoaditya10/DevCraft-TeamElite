import express from 'express';
import AdminScheme from '../models/AdminScheme.js';
import User from '../models/User.js';

const router = express.Router();

// Get all schemes for admin
router.get('/schemes', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const schemes = await AdminScheme.find()
      .sort({ createdAt: -1 })
      .populate('matchedStudents', 'fullName email');

    const schemeData = schemes.map(scheme => ({
      id: scheme._id,
      name: scheme.schemeName,
      department: scheme.department,
      state: scheme.state || 'All India',
      status: scheme.status,
      deadline: scheme.deadline.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      matchedStudents: scheme.matchedStudents.length,
      totalMatches: scheme.totalMatches
    }));

    return res.json({ schemes: schemeData });
  } catch (error) {
    console.error('Get schemes error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get single scheme details
router.get('/schemes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const scheme = await AdminScheme.findById(id).populate('matchedStudents', 'fullName email role dateOfBirth state district');
    
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    return res.json({ scheme });
  } catch (error) {
    console.error('Get scheme error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create new scheme
router.post('/schemes', async (req, res) => {
  try {
    console.log('=== POST /schemes called ===');
    const email = (req.query.email || '').toLowerCase();
    console.log('Email from query:', email);
    
    if (!email) {
      console.log('Email validation failed: Email is required');
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? `Yes (${user.email}, ${user.role})` : 'No');
    
    if (!user || user.role !== 'admin') {
      console.log('Authorization failed: User not admin');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const schemeData = req.body;
    console.log('Scheme data received:', {
      schemeName: schemeData.schemeName,
      department: schemeData.department,
      deadline: schemeData.deadline,
      status: schemeData.status,
      conditionsCount: schemeData.conditions?.length
    });
    
    // Validate required fields
    if (!schemeData.schemeName || !schemeData.department || !schemeData.deadline) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Creating scheme in database...');
    const newScheme = await AdminScheme.create({
      ...schemeData,
      createdBy: email
    });
    console.log('Scheme created successfully:', newScheme._id);

    // If publishing, match with eligible students
    if (schemeData.status === 'Published') {
      console.log('Matching students to scheme...');
      await matchStudentsToScheme(newScheme._id);
      console.log('Student matching complete');
    }

    return res.status(201).json({ 
      message: 'Scheme created successfully',
      scheme: newScheme 
    });
  } catch (error) {
    console.error('Create scheme error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update scheme
router.put('/schemes/:id', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const updates = req.body;

    const scheme = await AdminScheme.findById(id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    Object.assign(scheme, updates);
    await scheme.save();

    // If status changed to Published, match students
    if (updates.status === 'Published') {
      await matchStudentsToScheme(scheme._id);
    }

    return res.json({ 
      message: 'Scheme updated successfully',
      scheme 
    });
  } catch (error) {
    console.error('Update scheme error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete scheme
router.delete('/schemes/:id', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const scheme = await AdminScheme.findByIdDelete(id);

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    return res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    console.error('Delete scheme error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard analytics
router.get('/analytics', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const totalSchemes = await AdminScheme.countDocuments();
    const activeSchemes = await AdminScheme.countDocuments({ status: 'Published' });
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeUsers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Get recent activity (last 10 scheme creations/updates)
    const recentSchemes = await AdminScheme.find()
      .sort({ updatedAt: -1 })
      .limit(10);

    const activity = recentSchemes.map(scheme => ({
      title: scheme.status === 'Published' ? 'Scheme published' : 'Scheme updated',
      detail: `${scheme.schemeName} - ${scheme.status}`,
      time: getTimeAgo(scheme.updatedAt)
    }));

    return res.json({
      totalSchemes,
      activeSchemes,
      totalUsers,
      activeUsers,
      activity
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get students matched to a specific scheme
router.get('/schemes/:id/students', async (req, res) => {
  try {
    const email = (req.query.email || '').toLowerCase();
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const scheme = await AdminScheme.findById(id)
      .populate('matchedStudents', 'fullName email role dateOfBirth state district');

    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    return res.json({ 
      students: scheme.matchedStudents,
      total: scheme.matchedStudents.length
    });
  } catch (error) {
    console.error('Get students error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to match students to a scheme based on eligibility
async function matchStudentsToScheme(schemeId) {
  try {
    const scheme = await AdminScheme.findById(schemeId);
    if (!scheme || scheme.status !== 'Published') {
      return;
    }

    // Get all non-admin users
    const allStudents = await User.find({ role: { $ne: 'admin' } });
    const matchedStudentIds = [];

    for (const student of allStudents) {
      if (checkEligibility(student, scheme)) {
        matchedStudentIds.push(student._id);
      }
    }

    // Update scheme with matched students
    scheme.matchedStudents = matchedStudentIds;
    scheme.totalMatches = matchedStudentIds.length;
    await scheme.save();

    return matchedStudentIds.length;
  } catch (error) {
    console.error('Match students error:', error);
    return 0;
  }
}

// Check if a student is eligible for a scheme
function checkEligibility(student, scheme) {
  if (!scheme.conditions || scheme.conditions.length === 0) {
    return true; // No conditions means all eligible
  }

  // Evaluate all condition groups (they are joined by AND at the top level)
  for (const group of scheme.conditions) {
    const groupResult = evaluateConditionGroup(student, group);
    if (!groupResult) {
      return false; // If any group fails, student is not eligible
    }
  }

  return true;
}

function evaluateConditionGroup(student, group) {
  const { joiner, rows } = group;
  
  if (joiner === 'AND') {
    // All conditions in the group must be true
    return rows.every(row => evaluateCondition(student, row));
  } else {
    // At least one condition must be true
    return rows.some(row => evaluateCondition(student, row));
  }
}

function evaluateCondition(student, condition) {
  const { field, operator, value } = condition;
  
  let studentValue;
  
  // Map field names to student properties
  switch (field) {
    case 'Annual Income':
      studentValue = parseFloat(student.annualIncome || '0');
      break;
    case 'Age':
      if (student.dateOfBirth) {
        const birthDate = new Date(student.dateOfBirth);
        const today = new Date();
        studentValue = today.getFullYear() - birthDate.getFullYear();
      } else {
        studentValue = 0;
      }
      break;
    case 'Category':
      studentValue = student.category || '';
      break;
    case 'State':
      studentValue = student.state || '';
      break;
    case 'Education Level':
      studentValue = student.educationLevel || '';
      break;
    case 'Gender':
      studentValue = student.gender || '';
      break;
    case 'Marks Percentage':
      studentValue = parseFloat(student.marksPercentage || '0');
      break;
    case 'Minority Status':
      studentValue = student.isMinority ? 'Yes' : 'No';
      break;
    case 'Disability Status':
      studentValue = student.disability || 'No Disability';
      break;
    case 'Institution Type':
      studentValue = student.institutionType || '';
      break;
    default:
      return false;
  }

  // Evaluate based on operator
  switch (operator) {
    case 'Equals':
      return String(studentValue).toLowerCase() === String(value).toLowerCase();
    case 'Not Equals':
      return String(studentValue).toLowerCase() !== String(value).toLowerCase();
    case 'Less Than':
      return parseFloat(studentValue) < parseFloat(value);
    case 'Greater Than':
      return parseFloat(studentValue) > parseFloat(value);
    case 'Between':
      const [min, max] = value.split('-').map(v => parseFloat(v.trim()));
      return parseFloat(studentValue) >= min && parseFloat(studentValue) <= max;
    case 'Includes':
      return String(studentValue).toLowerCase().includes(String(value).toLowerCase());
    default:
      return false;
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return new Date(date).toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
}

export default router;
