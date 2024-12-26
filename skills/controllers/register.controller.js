const User = require('../models/User');

async function registerUser(req, res) {
  const { username, password, email } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Usuario ya registrado.');
    }

    const user = new User({ username, password, email });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor.');
  }
}
module.exports = { registerUser };
