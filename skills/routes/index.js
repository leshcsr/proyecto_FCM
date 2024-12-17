const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Skill = require('../models/skillmodel');
const Badge = require('../models/badgemodel');


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

/*SKILLS*/
router.get('/skill/add', (req, res) => {
  res.render('add-skill', { title: 'New Skill' });
});

router.get('/skills', async (req, res) => {
  try{
    let skills = await Skill.find();

    skills.forEach(skill => {
      if (typeof skill.textLines === 'string') {
        skill.textLines = [skill.textLines];
      }
    });
    res.render('skills', {skills});
  }catch(err){
    console.error("Error al obtener las habilidades:", err);
    res.status(500).send("Error del servidor");
  }
});

router.get('/skills/:id', async (req, res) => {
  const skillId = req.params.id;
  try{
    const skill = await Skill.findById( skillId );
    if (skill) {
      res.render('detail', { skill });
    } else {
      res.status(404).send('Skill no encontrado');
    }
  }catch(err){
    console.error("Error al obtener la habilidad:", err);
    res.status(500).send("Error del servidor");
  } 
});

router.get('/skills/:id/edit', async (req, res) => {
  const skillId = req.params.id;
  try{
    const skill = await Skill.findById( skillId );
    if (skill) {
      res.render('edit-skill', { skill });
    } else {
      res.status(404).send('Skill no encontrado');
    }
  }catch(err){
    console.error("Error al obtener la habilidad para edición:", err);
    res.status(500).send("Error del servidor");
  }
});


router.put('/skills/:id', async (req, res) => {
  const skillId = req.params.id;
  const { text, icon, description, tasks, score } = req.body;

  try {
    const updatedData = { text, icon, description, tasks, score };

    const updatedSkill = await Skill.findByIdAndUpdate(skillId, updatedData, { new: true, runValidators: true });
    if (updatedSkill) {
      res.status(200).json({ message: 'Skill actualizada exitosamente' });
    } else {
      res.status(404).json({ message: 'Habilidad no encontrada' });
    }
  } catch (err) {
    console.error('Error al actualizar la habilidad:', err);
    res.status(500).send('Error del servidor');
  }
});

router.post('/skill/add', async (req, res) => {
  const { text, icon, description, tasks, score, resources } = req.body;

  try {
    const newSkill = new Skill({ 
      text, 
      icon, 
      description, 
      tasks, 
      score, 
      skillTree: 'Electronics', 
      resources:['No hay recursos'] });
    await newSkill.save();
    
    res.redirect('/skills');
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ message: 'Datos inválidos', errors: err.errors });
    } else {
      console.error('Error al agregar la habilidad:', err);
      res.status(500).send('Error del servidor');
    }
  }
});

router.delete('/skills/:id', async (req, res) => {
  const skillId = req.params.id;

  try {
      const deletedSkill = await Skill.findByIdAndDelete(skillId);

      if (deletedSkill) {
          res.status(200).json({ message: 'Skill eliminada exitosamente' });
      } else {
          res.status(404).json({ message: 'Skill no encontrada' });
      }
  } catch (err) {
      console.error('Error al eliminar la skill:', err);
      res.status(500).json({ message: 'Error del servidor' });
  }
});



/*Badges*/

router.get('/badges', async (req, res) => {
  try {
    const badges = await Badge.find(); 
    res.render('badges', { badges });
  } catch (err) {
    console.error('Error al obtener las badges:', err);
    res.status(500).send('Error del servidor');
  }
});

router.get('/badges/:rango', async (req, res) => {
  const rango = req.params.rango;

  try {
    const badge = await Badge.findOne({ rango });
    if (badge) {
      res.render('edit-badge', { badge });
    } else {
      res.status(404).send('Medalla no encontrada');
    }
  } catch (err) {
    console.error('Error al obtener la badge:', err);
    res.status(500).send('Error del servidor');
  }
});

router.delete('/badges/:rango', async (req, res) => {
  const rango = req.params.rango;

  try {
      const deletedBadge = await Badge.findByIdAndDelete(rango);

      if (deletedBbadge) {
          res.status(200).json({ message: 'Medalla eliminada exitosamente' });
      } else {
          res.status(404).json({ message: 'Medalla no encontrada' });
      }
  } catch (err) {
      console.error('Error al eliminar la medalla:', err);
      res.status(500).json({ message: 'Error del servidor' });
  }
});

/*ABOUT US*/
router.get('/aboutus', (req, res) => {
  const badgesPath = path.join(__dirname, '../badges.json');
  const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
  res.render('aboutus', { badges });
});

module.exports = router;
