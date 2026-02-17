import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    label: { type: String, required: true },
    status: { type: String, enum: ['uploaded', 'missing', 'verified'], required: true }
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);

export default Document;
