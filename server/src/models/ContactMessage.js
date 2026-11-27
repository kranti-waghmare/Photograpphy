import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, required: true, trim: true },
    preferredPhotographer: { type: String, default: 'Any Available Master' },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
