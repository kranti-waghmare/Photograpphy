import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    duration: { type: String, required: true },
    deliverables: [{ type: String }],
    price: { type: Number, required: true },
    description: { type: String, required: true },
    popular: { type: Boolean, default: false },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true },
    role: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: String, required: true },
    shootType: { type: String, required: true },
  },
  { _id: false }
);

const photographerSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    specialty: { type: String, required: true },
    categories: [{ type: String }],
    bio: { type: String, required: true },
    quote: { type: String, required: true },
    avatar: { type: String, required: true },
    coverImage: { type: String, required: true },
    location: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    equipment: [{ type: String }],
    startingPrice: { type: Number, required: true },
    rating: { type: Number, required: true, default: 4.9 },
    reviewCount: { type: Number, required: true, default: 0 },
    packages: [packageSchema],
    reviews: [reviewSchema],
    featured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Photographer = mongoose.model('Photographer', photographerSchema);
