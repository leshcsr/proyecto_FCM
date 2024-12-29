const Skill = require('../models/skillmodel');

exports.renderAddSkill = (req, res) => {
  res.render('add-skill', { title: 'New Skill' });
};

// Obtener todas las habilidades
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();

    // Asegurarse de que textLines sea un array
    skills.forEach(skill => {
      if (typeof skill.textLines === 'string') {
        skill.textLines = [skill.textLines];
      }
    });

    res.render('skills', {
      skills,
      isAdmin: req.session.user && req.session.user.admin,
    });
  } catch (err) {
    console.error('Error al obtener las habilidades:', err);
    res.status(500).send('Error del servidor');
  }
};

// Obtener una habilidad específica por ID
exports.getSkillById = async (req, res) => {
  const skillId = req.params.id;
  try {
    const skill = await Skill.findById(skillId);
    if (skill) {
      res.render('detail', { skill });
    } else {
      res.status(404).send('Skill no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener la habilidad:', err);
    res.status(500).send('Error del servidor');
  }
};

// Renderizar formulario para editar una habilidad
exports.renderEditSkill = async (req, res) => {
  const skillId = req.params.id;
  try {
    const skill = await Skill.findById(skillId);
    if (skill) {
      res.render('edit-skill', { skill });
    } else {
      res.status(404).send('Skill no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener la habilidad para edición:', err);
    res.status(500).send('Error del servidor');
  }
};

// Crear una nueva habilidad
exports.createSkill = async (req, res) => {
  const { text, icon, description, tasks, score, resources } = req.body;

  try {
    const newSkill = new Skill({
      text,
      icon,
      description,
      tasks,
      score,
      skillTree: 'Electronics',
      resources: resources || ['No hay recursos'],
    });
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
};

// Actualizar una habilidad existente
exports.updateSkill = async (req, res) => {
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
};

// Eliminar una habilidad
exports.deleteSkill = async (req, res) => {
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
};
