const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  label: String,
  range: String,
  unlocked: Boolean,
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  hospitalId: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    default: 'doctor',
  },

  trustScore: {
    type: Number,
    default: 0,
  },

  anonymousAlias: {
    type: String,
    default: 'Anonymous Doctor',
  },

  reportsSubmitted: {
    type: Number,
    default: 0,
  },

  alertsReceived: {
    type: Number,
    default: 0,
  },

  certificatesEarned: {
    type: Number,
    default: 0,
  },

  tier: {
    type: String,
    default: 'Bronze',
  },

  badges: [BadgeSchema],
});

UserSchema.set('toJSON', {
  virtuals: true,

  transform: (doc, ret) => {
    ret.id = ret._id;

    delete ret._id;
    delete ret.__v;
    delete ret.password;

    return ret;
  },
});

module.exports = mongoose.model('User', UserSchema);