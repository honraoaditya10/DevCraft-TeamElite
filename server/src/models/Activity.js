import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true },
    detail: { type: String, required: true },
    timeLabel: { type: String, required: true }
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
