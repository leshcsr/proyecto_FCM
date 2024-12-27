function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
      return next();
  }
  res.redirect('/users/login');  // Change to match your login route
}

module.exports = { isAuthenticated };