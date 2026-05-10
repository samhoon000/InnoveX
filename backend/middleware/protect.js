const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../lib/jwt-secret');

const JWT_SECRET = getJwtSecret();

function protect(req, res, next) {
  const token =
    req.headers.authorization?.split(
      ' '
    )[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Token failed',
    });
  }
}

module.exports = protect;
