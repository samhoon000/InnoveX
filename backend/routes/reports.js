const express = require('express');
const router = express.Router();

const Report = require('../models/Report');

router.get('/', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const q = req.query.q || '';

    const query = q
      ? {
          $or: [
            {
              symptoms: {
                $regex: q,
                $options: 'i',
              },
            },
            {
              medicines: {
                $regex: q,
                $options: 'i',
              },
            },
            {
              diagnosis: {
                $regex: q,
                $options: 'i',
              },
            },
          ],
        }
      : {};

    const total = await Report.countDocuments(query);

    const items = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: 'Failed to fetch reports',
    });
  }
});

module.exports = router;