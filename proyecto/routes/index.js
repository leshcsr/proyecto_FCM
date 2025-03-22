const express = require('express');
const router = express.Router();
const Badge = require('../models/badgemodel');
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

router.get('/signin', (req, res) => {
  res.render('signin', { title: 'Registrate' });
});

/*Badges*/

router.get('/badges', isAuthenticated, async (req, res) => {
  try {
    const badges = await Badge.find(); 
    const users = await User.find(); 

    res.locals.users = users;

    res.render('badges', { badges });
  } catch (err) {
    console.error('Error al obtener la información:', err);
    res.status(500).send('Error del servidor');
  }
});

router.get('/badges/:id', isAuthenticated, async (req, res) => {
  const id = req.params.id;

  try {

    const badge = await Badge.findOne({ _id: id });
    if (badge) {
      res.render('edit-badge', { badge });
    } else {
      res.status(404).send('Medalla no encontrada');
    }
  } catch (err) {
    console.error('Error al obtener la badge:', err);
    res.status(500).send('Error del servidor');
  }
});

router.delete('/badges/:rango', isAuthenticated, isAdmin, async(req, res) => {
  const {rango} = req.params;
  try {
    const deletedBadge = await Badge.findOneAndDelete({ rango });
    if (!deletedBadge){
      console.error(`No se encontró una medalla con rango: ${rango}`);
      return res.status(400).json({ message: 'No se encontró la medalla para eliminar' });
    }
    res.status(200).json({message: 'Medalla eliminada correctamente'});
  } catch (error) {
    console.error('Error eliminando la medalla: ', error);
    res.status(500).json({message: 'Error interno del servidor'});
  }
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