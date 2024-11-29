const mongoose = require('mongoose');

// Definición del esquema de Skill
const skillSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    default: null // Opcional: si no se proporciona, será null
  },
  set: { 
    type: String, 
    required: true // Ejemplo: 'electronics', 'programming'
  },
  tasks: [{ 
    type: String, 
    required: true // Lista de tareas necesarias para obtener la competencia
  }],
  resources: [{ 
    type: String, 
    default: [] // Lista de URLs o textos con recursos de aprendizaje
  }],
  description: { 
    type: String, 
    required: true // Breve descripción de la competencia
  },
  score: { 
    type: Number, 
    default: 1 // Puntuación asignada por defecto a la competencia
  }
}, {
  timestamps: true // Agrega automáticamente los campos createdAt y updatedAt
});

// Crear el modelo
module.exports = mongoose.model('Skill', skillSchema);
