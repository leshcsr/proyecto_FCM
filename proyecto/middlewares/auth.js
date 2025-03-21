function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      req.user = req.session.user;
      return next();
  }
  res.redirect('/users/login'); 
}

function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.isAdmin) {
      return next();
  }
  res.status(403).send('Acceso denegado: Solo administradores pueden realizar esta acción.');
}

module.exports = { isAuthenticated, isAdmin };