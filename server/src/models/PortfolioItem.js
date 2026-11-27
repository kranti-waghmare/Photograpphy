import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Editorial', 'Weddings', 'Architecture', 'Portraits', 'Fine Art'],
    },
    photographerSlug: { type: String, required: true },
    photographerName: { type: String, required: true },
    image: { type: String, required: true },
    aspect: {
      type: String,
      enum: ['portrait', 'landscape', 'square'],
      default: 'portrait',
    },
    camera: { type: String, required: true },
    lens: { type: String, required: true },
    settings: { type: String, required: true },
    location: { type: String, required: true },
    year: { type: String, required: true },
    featured: { type: Boolean, default: false },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);
