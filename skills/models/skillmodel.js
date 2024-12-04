//SKILL MODEL
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true, 
    minlength: 2, 
    maxlength: 60  
  },
  icon: { 
    type: String, 
    default: 'https://www.flaticon.es/icono-gratis/configuraciones_503827?term=defecto&page=1&position=5&origin=search&related_id=503827'
  },
  description: { 
    type: String, 
    required: true,
    minlength: 10, 
    maxlength: 300 
  },
  tasks: [{ 
    type: [String], 
    validate: {
      validator: function (value) {
        return value.length >= 1 && value.length <= 5;
      },
      message: 'Debe haber entre 1 y 5 tareas.'
    },
    required: true 
  }],
  score: { 
    type: Number, 
    default: 1,
    min: 1,
    max: 5,
  },
  skillTree: { 
    type: String, 
  },
  resources: [{ 
    type: String, 
    default: ['No hay recursos'] 
  }],
}, {
});

module.exports = mongoose.model('Skill', skillSchema, 'skills');
