const User = require('../models/User');

async function loginUser(req, res) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send('Credenciales incorrectas.');
    }

    // Crear sesión
    req.session.user = { id: user._id, username: user.username, admin: user.admin };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor.');
  }
}

module.exports = { loginUser };
