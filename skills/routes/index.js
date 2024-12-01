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
router.get('/skill/add', (req, res) => {
  res.render('add-skill', { title: 'New Skill' });
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

router.get('/leaderboard/:rango', (req, res) => {
  const rango = req.params.rango;
  const badgesPath = path.join(__dirname, '../badges.json');

  const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
  const badge = badges.find(b => b.rango === rango);

  if (badge) {
    res.render('edit-badge', { badge });
  } else {
    res.status(404).send('Medalla no encontrada');
  }
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

router.get('/skills/:id/edit', (req, res) => {
  const skillId = parseInt(req.params.id, 10);
  const competencias = JSON.parse(fs.readFileSync('competencias.json', 'utf8'));
  const skill = competencias.find(c => c.id === skillId);

  if (skill) {
    res.render('edit-skill', { skill });
  } else {
    res.status(404).send('Skill no encontrado');
  }
});


module.exports = router;
