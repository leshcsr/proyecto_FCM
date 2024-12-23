//BADGES MODEL
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
   rango: { 
    type: String, 
    required: true, 
    minlength: 2, 
    maxlength: 60,
    trim: true,
  },
  bitpoints_min: {  type: Number, require: true, min: 0,  },
  bitpoints_max: {
    type: Number,
    required: true, 
    min: 0, 
  },
  png: {
    type: String,
    required: true,
  },
},
);

module.exports = mongoose.model('Badge', badgeSchema, 'badges');
