import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'normalUser', 'admin'], default: 'student' },
    dateOfBirth: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    // Eligibility-related fields
    annualIncome: { type: Number, default: null },
    category: { type: String, default: '', enum: ['', 'General', 'OBC', 'SC', 'ST'] },
    educationLevel: { type: String, default: '', enum: ['', '10th', '12th', 'Diploma', 'UG', 'PG'] },
    gender: { type: String, default: '', enum: ['', 'Male', 'Female', 'Other'] },
    minorityStatus: { type: String, default: '', enum: ['', 'Yes', 'No'] },
    disabilityStatus: { type: String, default: '', enum: ['', 'No Disability', 'Physical', 'Visual', 'Hearing', 'Other'] },
    institutionType: { type: String, default: '', enum: ['', 'Government', 'Private'] },
    marksPercentage: { type: Number, default: null }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
