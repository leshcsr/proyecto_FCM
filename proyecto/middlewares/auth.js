function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
  }
  res.redirect('/users/login');  // Change to match your login route
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.admin) {
      return next();
  }
  res.status(403).send('Acceso denegado: Solo administradores pueden realizar esta acción.');
}

module.exports = { isAuthenticated, isAdmin };