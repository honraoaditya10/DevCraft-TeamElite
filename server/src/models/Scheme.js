import mongoose from 'mongoose';

const schemeSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    deadlineDate: { type: Date, required: true },
    deadlineLabel: { type: String, required: true },
    status: { type: String, enum: ['eligible', 'needs_action'], default: 'eligible' },
    missingRequirement: { type: String, default: '' }
  },
  { timestamps: true }
);

const Scheme = mongoose.model('Scheme', schemeSchema);

export default Scheme;
