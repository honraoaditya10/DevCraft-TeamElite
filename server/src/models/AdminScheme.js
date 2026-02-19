import mongoose from 'mongoose';

const conditionRowSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  field: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const conditionGroupSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  joiner: { type: String, enum: ['AND', 'OR'], default: 'AND' },
  rows: [conditionRowSchema]
}, { _id: false });

const adminSchemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    schemeType: { type: String, default: 'Scholarship' },
    region: { type: String, default: 'Central' },
    state: { type: String, trim: true },
    website: { type: String, trim: true },
    deadline: { type: Date, required: true },
    description: { type: String, trim: true },
    
    // Eligibility conditions
    conditions: [conditionGroupSchema],
    
    // Required documents
    requiredDocs: {
      income: { type: Boolean, default: false },
      caste: { type: Boolean, default: false },
      domicile: { type: Boolean, default: false },
      aadhaar: { type: Boolean, default: false },
      marksheet: { type: Boolean, default: false },
      bank: { type: Boolean, default: false }
    },
    
    // Scheme status
    status: { 
      type: String, 
      enum: ['Draft', 'Published', 'Paused', 'Expired'], 
      default: 'Draft' 
    },
    
    visibility: { 
      type: String, 
      enum: ['Public', 'Restricted (Pilot Mode)'], 
      default: 'Public' 
    },
    
    // Auto extraction settings
    autoExtract: { type: Boolean, default: true },
    uploadedFile: { type: String },
    
    // Matching statistics
    matchedStudents: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    
    totalMatches: { type: Number, default: 0 },
    
    // Admin who created this
    createdBy: { type: String, required: true }
  },
  { 
    timestamps: true 
  }
);

// Index for faster queries
adminSchemeSchema.index({ status: 1, deadline: 1 });
adminSchemeSchema.index({ createdBy: 1 });

const AdminScheme = mongoose.model('AdminScheme', adminSchemeSchema);

export default AdminScheme;
