const express = require('express');
const router = express.Router();
const Skill = require('../models/skillmodel');
const Badge = require('../models/badgemodel');
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const { userInfo } = require('os');
const skillRoutes = require('./skills');
const User = require('../models/usermodel.js');
const bcrypt = require('bcrypt');


/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Skills App' });
});

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

/*SKILLS*/
router.use('/skills', skillRoutes);

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

router.put('/badges/:id', isAdmin, isAuthenticated, async (req, res) => {
  const badgeId = req.params.id;
  const { rango, bitpoints_min, bitpoints_max, png } = req.body;

  // Validación extra (opcional)
  if (bitpoints_min > bitpoints_max) {
    return res.status(400).json({ message: 'Bitpoints mínimos no pueden ser mayores que los máximos' });
  }
  
    // Validación de la URL (png)
    const urlPattern = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(:\d+)?(\/[^\s]*)+\.(jpg|png)$/i;
    if (png && !urlPattern.test(png)) {
    return res.status(400).json({ message: 'El enlace de la imagen no es válido' });
  } else {
    console.log('URL válida:', png); 
  }

  try {
    const updatedData = { rango, bitpoints_min, bitpoints_max, png };

    const updatedBadge = await Badge.findByIdAndUpdate(badgeId, updatedData, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    if (updatedBadge) {
      res.status(200).json({ message: 'Medalla actualizada exitosamente', badge: updatedBadge });
    } else {
      res.status(404).json({ message: 'Medalla no encontrada' });
    }
  } catch (err) {
    console.error('Error al actualizar la medalla:', err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Error del servidor' });
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