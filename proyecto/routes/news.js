const express = require('express');
const UserController = require('../controllers/user.controller.js');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth.js');

router.get('/', (req, res) => {
    res.render('news', { currentView: 'news' });
});

router.get('/gallery', (req, res) => {
    res.render('gallery', { currentView: 'gallery' });
});

router.get('/create', (req, res) => {
    res.render('create-news');
});

module.exports = router;