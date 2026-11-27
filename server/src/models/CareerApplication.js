import mongoose from 'mongoose';

const careerApplicationSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true },
    roleTitle: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    portfolioUrl: { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true, min: 0 },
    coverNote: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const CareerApplication = mongoose.model('CareerApplication', careerApplicationSchema);
