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
    validate: {
      validator: function (value) {
        return value >= this.bitpoints_min;
      },
      message: 'bitpoints_max debe ser mayor o igual a bitpoints_min',
    },
  },
  png: {
    type: String,
    required: true,
    validate: {
      validator: function (url) {
        return /^https?:\/\/.+\.(png|jpg|jpeg|svg)$/i.test(url);
      },
      message: 'El campo png debe ser una URL válida de una imagen',
    },
  },
},
);

module.exports = mongoose.model('Badge', badgeSchema, 'badges');
