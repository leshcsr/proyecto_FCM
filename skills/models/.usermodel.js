const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
      },
    password: { type: String, required: true },
    score: { 
        type: Number, 
        default: 0
      },
      admin: { 
        type: Boolean, 
        default: false
      },
      completedSkills: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Skill' 
      }]
    }, 
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Evitar re-encriptar si no cambió
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

module.exports = mongoose.model('User', userSchema);
