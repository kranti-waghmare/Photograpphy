import express from 'express';
import { Photographer } from '../models/Photographer.js';

const router = express.Router();

// GET /api/photographers
router.get('/', async (_req, res, next) => {
  try {
    const photographers = await Photographer.find().sort({ createdAt: 1 }).lean();
    res.json({ photographers });
  } catch (err) {
    next(err);
  }
});

// GET /api/photographers/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const photographer = await Photographer.findOne({ slug: req.params.slug }).lean();
    if (!photographer) {
      return res.status(404).json({ error: 'Photographer not found.' });
    }
    res.json({ photographer });
  } catch (err) {
    next(err);
  }
});

// POST /api/photographers/:slug/reviews
router.post('/:slug/reviews', async (req, res, next) => {
  try {
    const { clientName, role, rating, comment, shootType } = req.body;
    if (!clientName || !comment || !rating) {
      return res.status(400).json({ error: 'Client name, rating, and review comment are required.' });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const photographer = await Photographer.findOne({ slug: req.params.slug });
    if (!photographer) {
      return res.status(404).json({ error: 'Photographer not found.' });
    }

    const newReview = {
      clientName: clientName.trim(),
      role: (role || 'Verified Studio Client').trim(),
      rating: numericRating,
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      shootType: (shootType || photographer.categories[0] || 'Private Session').trim(),
    };

    photographer.reviews.unshift(newReview);
    const totalCount = photographer.reviewCount + 1;
    const weightedAvg =
      (photographer.rating * photographer.reviewCount + numericRating) / totalCount;
    photographer.reviewCount = totalCount;
    photographer.rating = Number(weightedAvg.toFixed(2));

    await photographer.save();
    res.status(201).json({ photographer, review: newReview });
  } catch (err) {
    next(err);
  }
});

export default router;
