const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  // Optional reference to specific profile ID if needed
  profileId: { type: mongoose.Schema.Types.ObjectId, refPath: 'role' }
});

module.exports = mongoose.model('User', UserSchema);
