const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { userInfo } = require('os');
const User = require('../models/usermodel.js');
const bcrypt = require('bcrypt');
const UserController = require('../controllers/user.controller');


/* GET home page. */
router.get('/', isAuthenticated, UserController.home);

/* GET Login */
router.get('/login', (req, res) => {
  res.render('login', { 
    title: 'Iniciar Sesión',
    error: null,
    username: ''
  });
});

/* GET Sign In */
router.get('/signin', (req, res) => {
  res.render('signin', { title: 'Registrate' });
});

/*ABOUT US*/
router.get('/aboutus', (req, res) => {
 res.render('aboutus',);
});

/*USERS*/
router.patch('/users/:username/change-password', isAuthenticated, isAdmin, async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;

  if (!password) {
      return res.status(400).json({ message: 'La contraseña es obligatoria.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findOneAndUpdate(
        { username },
        { password: hashedPassword },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    console.log('Usuario actualizado:', updatedUser);
    res.status(200).json({ message: 'Contraseña cambiada exitosamente.' });
} catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ message: 'Error del servidor.' });
}
});

module.exports = router;