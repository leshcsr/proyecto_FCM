const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Skills App' });
});

/* GET Login */
router.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
});

router.get('/skills', (req, res) => {
  let competenciasPath = path.join(__dirname, '../competencias.json');
  let competencias = JSON.parse(fs.readFileSync(competenciasPath, 'utf8'));

  competencias = competencias.map(skill => {
    if (skill.text.length > 15) {
      skill.textLines = skill.text.match(/.{1,15}/g); 
    } else {
      skill.textLines = [skill.text];
    }
    return skill;
  });


  res.render('skills', {competencias});
});

module.exports = router;
