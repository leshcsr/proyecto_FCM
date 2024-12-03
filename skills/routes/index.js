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
router.get('/signin', (req, res) => {
  res.render('signin', { title: 'Registrate' });
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

router.get('/leaderboard', (req, res) => {
  const badgesPath = path.join(__dirname, '../badges.json');
  const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
  res.render('leaderboard', { badges });
});

router.get('/aboutus', (req, res) => {
  const badgesPath = path.join(__dirname, '../badges.json');
  const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
  res.render('aboutus', { badges });
});

router.get('/skills/:id', (req, res) => {
  const skillId = parseInt(req.params.id, 10);
  const competencias = JSON.parse(fs.readFileSync('competencias.json', 'utf8'));
  const skill = competencias.find(c => c.id === skillId);

  if (skill) {
    res.render('detail', { skill });
  } else {
    res.status(404).send('Skill no encontrado');
  }
});



module.exports = router;
