// controllers/user.controller.js
const UserModel = require('../models/usermodel.js');
const fetch = require('node-fetch');

exports.register = async (req, res) => {
    const {
        nombre = "",
        apellidos = "",
        casa = "",
        carrera = "",
        fecha_nac = "",
        telefono = "",
        correo = "",
        contraseña = "",
        intereses = "",
        isAdmin = false,
    } = req.body;
    console.log("Datos recibidos en el backend:", req.body);


  try {
    const existingUser = await UserModel.getUserByEmail(correo);
    if (existingUser) {
      return res.status(400).send('El correo ya está en uso.');
    }

    // Validación extra: asegurarse de que los valores obligatorios no están vacíos
    if (!nombre || !apellidos || !correo || !contraseña) {
        return res.status(400).send('Todos los campos son obligatorios.');
      }

    const newUser = await UserModel.createUser({
      nombre, apellidos, casa, carrera, fecha_nac, telefono, correo, contraseña, intereses, isAdmin
    });

    res.redirect('/users/login');
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send('Error del servidor.');
  }
};

exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const user = await UserModel.getUserByEmail(correo);

    if (!user) {
      return res.render('login', { error: 'Correo o contraseña incorrectos', correo });
    }

    const isMatch = await UserModel.comparePassword(contraseña, user.contraseña);

    if (!isMatch) {
      return res.render('login', { error: 'Correo o contraseña incorrectos', correo });
    }

    req.session.user = {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      casa: user.casa,
      carrera: user.carrera,
      fecha_nac: user.fecha_nac,
      telefono: user.telefono,
      correo: user.correo,
      intereses: user.intereses,
      isAdmin: user.isAdmin,
    };

    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Error del servidor. Por favor, inténtelo de nuevo.', correo });
  }
};

exports.logout = async (req, res) => {
  try {
    await req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/users/login');
  } catch (err) {
    console.error('Error destroying session:', err);
    res.redirect('/');
  }
};

exports.sessionTest = (req, res) => {
  const sessionInfo = {
    views: req.session.views ? ++req.session.views : 1,
    sessionID: req.sessionID,
    userSession: {
      loggedIn: !!req.session.user,
      userData: req.session.user || 'No user logged in',
    },
  };
  if (!req.session.views) {
    req.session.views = 1;
  }
  const formattedResponse = {
    ...sessionInfo,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };
  res.json(formattedResponse);
};

exports.testSession = (req, res) => {
  console.log('Current session:', {
    id: req.sessionID,
    user: req.session.user,
    isAuthenticated: !!req.session.user,
  });
  res.json({
    sessionID: req.sessionID,
    user: req.session.user || 'No user in session',
    isAuthenticated: !!req.session.user,
  });
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.getUserById(id);
        if (user) {
        res.json(user);
        } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await UserModel.getUserByEmail(email);
        if (user) {
        res.json(user);
        } else {
        res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
exports.getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;
        const updatedUser = await UserModel.updateUser(id, userData);
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await UserModel.deleteUser(id);
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.home = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/users/login');
    }

try {
    const response = await fetch('https://zenquotes.io/api/random');
    const data = await response.json();
    const quote = data[0]; 

    const today = new Date();
    const month = today.getMonth() + 1;
    const birthdays = await UserModel.getBirthdaysByMonth(month);

    res.render('home', {
      user: req.session.user,
      quote,
      birthdays,
    });
  } catch (err) {
    console.error('Error en Home:', err);
    res.render('home', { error: 'Error al cargar datos.', user: req.session.user });
  }
};
