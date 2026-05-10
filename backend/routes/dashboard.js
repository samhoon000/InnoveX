const express = require('express');

const User = require('../models/User');
const Report = require('../models/Report');
const Alert = require('../models/Alert');

const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    console.log(
      'Dashboard User:',
      user
    );

    const reports = await Report.find().sort({
      createdAt: -1,
    });

    const alertCount =
      await Alert.countDocuments();

    res.json({
      overview: {
        reportsSubmitted:
          Number(
            user.reportsSubmitted
          ) || 0,

        alertsReceived:
          Number(alertCount) || 0,

        trustScore:
          Number(user.trustScore) || 0,

        certificatesEarned:
          Number(
            user.certificatesEarned
          ) || 0,
      },

      doctor: {
        _id: user._id,

        name: user.name,

        anonymousAlias:
          user.anonymousAlias ||
          'Anonymous Doctor',

        trustScore:
          Number(user.trustScore) || 0,

        tier:
          user.tier || 'Bronze',

        badges: user.badges || [],

        reportsSubmitted:
          Number(
            user.reportsSubmitted
          ) || 0,

        alertsReceived:
          Number(alertCount) || 0,

        certificatesEarned:
          Number(
            user.certificatesEarned
          ) || 0,
      },

      reports,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;