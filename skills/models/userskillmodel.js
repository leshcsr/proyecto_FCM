const mongoose = require('mongoose');

const UserSkillSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  evidence: { type: String },
  verified: { type: Boolean, default: false },
  verifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('UserSkill', UserSkillSchema);
