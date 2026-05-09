const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hospitalId: { type: String, required: true },
  role: { type: String, default: 'doctor' },
  trustScore: { type: Number, default: 98 },
  anonymousAlias: { type: String, default: () => `Dr. ${Math.random().toString(36).substring(7).toUpperCase()}` },
});

// Avoid 'id' virtual and toJSON weirdness
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
