import express from 'express';
import { PortfolioItem } from '../models/PortfolioItem.js';

const router = express.Router();

// GET /api/portfolio
router.get('/', async (req, res, next) => {
  try {
    const { category, photographerSlug, featured } = req.query;
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (photographerSlug && photographerSlug !== 'all') filter.photographerSlug = photographerSlug;
    if (featured === 'true') filter.featured = true;

    const items = await PortfolioItem.find(filter).sort({ featured: -1, createdAt: 1 }).lean();
    res.json({ items });
  } catch (err) {
    next(err);
  }
});

export default router;
