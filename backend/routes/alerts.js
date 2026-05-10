const express = require('express');

const router = express.Router();

const Alert = require('../models/Alert');

router.get('/', async (req, res) => {
  try {
    console.log('ALERT ROUTE HIT');

    const { severity } = req.query;

    let query = {};

    if (
      severity &&
      severity !== 'all'
    ) {
      query.severity = severity;
    }

    const alerts = await Alert.find(query).sort({
      createdAt: -1,
    });

    console.log(
      'FOUND ALERTS:',
      alerts
    );

    res.json({
      alerts,
    });
  } catch (err) {
    console.error(
      'ALERT ROUTE ERROR:',
      err
    );

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;