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

router.get('/badges/:rango/edit', async (req, res) => {
  const badgeRango = req.params.rango;
  try{
    const badges = await Skill.findById( badgeRango );
    if (badges) {
      res.render('edit-badge', { badges });
    } else {
      res.status(404).send('Medalla no encontrado');
    }
  }catch(err){
    console.error("Error al obtener la habilidad para edición:", err);
    res.status(500).send("Error del servidor");
  }
});

router.delete('/badges/:rango', async(req, res) => {
  const {rango} = req.params;
  try {
    console.log(`Intentando eliminar badge con ID: ${rango}`);
    const deletedBadge = await Badge.findOneAndDelete({ rango });
    if (!deletedBadge){
      console.error(`No se encontró una medalla con rango: ${rango}`);
      return res.status(400).json({ message: 'No se encontró la medalla para eliminar' });
    }
    res.status(200).json({message: 'Medalla eliminada correctamente'});
  } catch (error) {
    console.error('Error eliminando la medalla: ', error);
    res.status(500).json({message: 'Error interno del servidor'});
  }
});

router.put('/badges/:id', async (req, res) => {
  const badgeId = req.params.id;
  const { nombre, rango, bitpoints_min, bitpoints_max, png } = req.body;

  // Validación extra (opcional)
  if (bitpoints_min > bitpoints_max) {
    return res.status(400).json({ message: 'Bitpoints mínimos no pueden ser mayores que los máximos' });
  }

  try {
    const updatedData = { nombre, rango, bitpoints_min, bitpoints_max, png };

    const updatedBadge = await Badge.findByIdAndUpdate(badgeId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (updatedBadge) {
      res.status(200).json({ message: 'Medalla actualizada exitosamente', badge: updatedBadge });
    } else {
      res.status(404).json({ message: 'Medalla no encontrada' });
    }
  } catch (err) {
    console.error('Error al actualizar la medalla:', err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

router.post('/leaderboard/:rango', async (req, res) => {
  try {
    const { rango } = req.params;
    const { bitpoints_min, bitpoints_max, png } = req.body;

    const badge = await Badge.findOne({ rango });
    if (!badge) {
      return res.status(404).json({ message: 'Medalla no encontrada' });
    }

    badge.bitpoints_min = bitpoints_min;
    badge.bitpoints_max = bitpoints_max;
    badge.png = png;

    await badge.save();

    // Enviar los datos actualizados de la medalla como respuesta
    res.json({
      rango: badge.rango,
      bitpoints_min: badge.bitpoints_min,
      bitpoints_max: badge.bitpoints_max,
      png: badge.png,
    });
  } catch (err) {
    res.status(400).json({ message: `Error al actualizar la medalla: ${err.message}` });
  }
});

/*ABOUT US*/
router.get('/aboutus', (req, res) => {
  const badgesPath = path.join(__dirname, '../badges.json');
  const badges = JSON.parse(fs.readFileSync(badgesPath, 'utf8'));
  res.render('aboutus', { badges });
});

module.exports = router;

