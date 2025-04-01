const express = require('express');
const UserController = require('../controllers/user.controller.js');
const NewsController = require('../controllers/news.controller.js');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth.js');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', NewsController.getNews);

router.get('/gallery', (req, res) => {
    res.render('gallery', { currentView: 'gallery' });
});

router.get('/create',  isAuthenticated, (req, res) => {
    res.render('create-news');
});

router.post('/create', isAuthenticated, upload.array('images', 15), NewsController.createNews);

module.exports = router;