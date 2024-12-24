const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/usermodel.js');

/* GET */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/register', async (req, res) => {
  const { username, password, passwordConfirm, email } = req.body;

  if (password !== passwordConfirm) {
      return res.status(400).send('Las contraseñas no coinciden.');
  }

  if (password.length < 6) {
      return res.status(400).send('La contraseña debe tener al menos 6 caracteres.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).send('Formato de email inválido.');
  }

  try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
          return res.status(400).send('El nombre de usuario o email ya está en uso.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
          username,
          email,
          password: hashedPassword,
          score: 0, // Puntuación inicial
          admin: false, // Rol predeterminado
          completedSkills: [] // Lista vacía inicialmente
      });

      await newUser.save();

      res.redirect('/login'); // Redirigir al login después del registro exitoso
  } catch (err) {
      console.error(err);
      res.status(500).send('Error del servidor.');
  }
});

module.exports = router;
