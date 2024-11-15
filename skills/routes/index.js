const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Skills App' });
});

/* GET Login */
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
});

router.get('/skills', (req, res) => {
  res.render('skills');
});

module.exports = router;
