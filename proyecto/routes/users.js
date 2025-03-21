// routes/user.routes.js
const express = require('express');
const UserController = require('../controllers/user.controller.js');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth.js');

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/register', UserController.register);
router.post('/login', UserController.login);

router.get('/logout', UserController.logout);
router.get('/session-test', UserController.sessionTest);
router.get('/test-session', UserController.testSession);

router.get('/:id',isAuthenticated, UserController.getUserById);
router.get('/email/:email', isAuthenticated, UserController.getUserByEmail);
router.get('/', isAuthenticated, UserController.home);

router.put('/:id', isAuthenticated, UserController.updateUser);

router.delete('/:id', isAuthenticated, isAdmin, UserController.deleteUser);

module.exports = router;