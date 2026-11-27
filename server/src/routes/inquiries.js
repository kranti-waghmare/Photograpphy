import express from 'express';
import { ContactMessage } from '../models/ContactMessage.js';
import { CareerApplication } from '../models/CareerApplication.js';

const router = express.Router();

// POST /api/inquiries/contact
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, phone, subject, preferredPhotographer, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }

    const inquiry = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      preferredPhotographer,
      message,
    });

    res.status(201).json({
      message: 'Thank you. Our studio producer will respond within 4 business hours.',
      inquiry,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/inquiries/careers
router.post('/careers', async (req, res, next) => {
  try {
    const { roleId, roleTitle, fullName, email, portfolioUrl, experienceYears, coverNote } = req.body;
    if (!roleId || !roleTitle || !fullName || !email || !portfolioUrl || !coverNote) {
      return res.status(400).json({ error: 'Please complete all application fields.' });
    }

    const application = await CareerApplication.create({
      roleId,
      roleTitle,
      fullName,
      email,
      portfolioUrl,
      experienceYears: Number(experienceYears || 0),
      coverNote,
    });

    res.status(201).json({
      message: 'Application received. Our creative directors review every portfolio personally.',
      application,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
