const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/usermodel.js');

/* GET */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Route to test session, provided by claude.com
router.get('/session-test', (req, res) => {
    const sessionInfo = {
        views: req.session.views ? ++req.session.views : 1,
        sessionID: req.sessionID,
        userSession: {
            loggedIn: !!req.session.user,
            userData: req.session.user ? {
                id: req.session.user._id,
                username: req.session.user.username,
                email: req.session.user.email,
                score: req.session.user.score,
                admin: req.session.user.admin,
                completedSkills: req.session.user.completedSkills || [],
            } : 'No user logged in'
        }
    };
    if (!req.session.views) {
        req.session.views = 1;
    }
    // Format the response for better readability
    const formattedResponse = {
        ...sessionInfo,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };

    res.json(formattedResponse);
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

//we have this route because when we initialize the page the component is expecting an error
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await User.findOne({ username });
       
        if (!user) {
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos',
                username: username
            });
        }
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
       
        if (!isMatch) {
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos',
                username: username
            });
        }

        // Convert user document to object and remove sensitive data
        const userObject = user.toObject();
        delete userObject.password;  // Remove password
        delete userObject.__v;       // Remove version key

        // Save user data in session
        req.session.user = userObject;

        // Log session data for debugging
        console.log('Session user data:', req.session.user);

        // Successful login - redirect to skills page
        res.redirect('/skills');
    } catch (err) {
        console.error(err);
        res.render('login', {
            error: 'Error del servidor. Por favor, inténtelo de nuevo.',
            username: username
        });
    }
});

module.exports = router;
