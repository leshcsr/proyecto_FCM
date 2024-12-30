const Skill = require('../models/skillmodel');
const UserSkill = require('../models/userskillmodel');
const User = require('../models/usermodel'); 

exports.renderAddSkill = (req, res) => {
  res.render('add-skill', { title: 'New Skill' });
};

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find();

    skills.forEach(skill => {
      if (typeof skill.textLines === 'string') {
        skill.textLines = [skill.textLines];
      }
    });

    const incompleteSkills = await UserSkill.find({ completed: false }).select('skill');
    const incompleteSkillIds = incompleteSkills.map(us => us.skill.toString());

    let completedSkills = [];
    if (req.session.user) {
      const user = await User.findById(req.session.user._id).populate('completedSkills');
      completedSkills = user.completedSkills.map(skill => skill._id.toString());
    }

    res.render('skills', {
      skills,
      isAdmin: req.session.user && req.session.user.admin,
      completedSkills,
      incompleteSkillIds,
    });
  } catch (err) {
    console.error('Error al obtener las habilidades:', err);
    res.status(500).send('Error del servidor');
  }
};

exports.getSkillById = async (req, res) => {
  const skillId = req.params.id;
  try {
    const skill = await Skill.findById(skillId);

    if (skill) {
      const userSkills = await UserSkill.find({ skill: skillId, completed: false })
        .populate('user', 'username') // Puedes agregar más campos del usuario si los necesitas
        .exec();

      res.render('detail', { 
        skill, 
        isAdmin: req.session.user && req.session.user.admin,
        userSkills,
      });
    } else {
      res.status(404).send('Skill no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener la habilidad:', err);
    res.status(500).send('Error del servidor');
  }
};

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

exports.updateEvidence = async (req, res) => {
  try {

    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado.' });
    }

    const { skillId, evidence } = req.body;
    const userId = req.user._id; 

    if (!evidence) {
        return res.status(400).json({ error: 'La evidencia es obligatoria.' });
    }

    const newUserSkill = new UserSkill({
      user: userId,
      skill: skillId,
      evidence: evidence,
      completed: false,
    });

    await newUserSkill.save();

    res.json({ message: 'Evidencia cargada exitosamente.', data: newUserSkill });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al actualizar la evidencia.' });
  }

};

// In controllers/skills.controller.js

exports.verifySkillEvidence = async (req, res) => {
  try {
      const userSkillId = req.body.userSkillId;
      const verifierId = req.user._id; // Current user doing the verification

      // Find the UserSkill document
      const userSkill = await UserSkill.findById(userSkillId)
          .populate('user')
          .populate('skill')
          .populate('verifications');

      if (!userSkill) {
          return res.status(404).json({ error: 'Evidence submission not found' });
      }

      // Check if the verifier has already verified this skill
      if (userSkill.verifications.some(v => v.equals(verifierId))) {
          return res.status(400).json({ error: 'You have already verified this skill' });
      }

      // Get the verifier's user document to check if they're admin or have completed the skill
      const verifier = await User.findById(verifierId).populate('completedSkills');
      const hasCompletedSkill = verifier.completedSkills.some(skill => 
          skill._id.equals(userSkill.skill._id)
      );

      if (!verifier.admin && !hasCompletedSkill) {
          return res.status(403).json({ 
              error: 'You must be an admin or have completed this skill to verify it' 
          });
      }

      // Add the verification
      userSkill.verifications.push(verifierId);

      // Check if the skill should be marked as completed
      const isNowVerified = verifier.admin || userSkill.verifications.length >= 3;

      if (isNowVerified) {
          userSkill.completed = true;
          userSkill.completedAt = new Date();
          userSkill.verified = true;

          // Add the skill to user's completed skills and update their score
          const skillOwner = userSkill.user;
          if (!skillOwner.completedSkills.includes(userSkill.skill._id)) {
              skillOwner.completedSkills.push(userSkill.skill._id);
              skillOwner.score += userSkill.skill.score;
              await skillOwner.save();
          }
      }

      await userSkill.save();

      res.json({
          success: true,
          message: isNowVerified ? 
              'Skill has been verified and marked as completed' : 
              'Verification added successfully',
          verifications: userSkill.verifications.length,
          completed: userSkill.completed
      });

  } catch (error) {
      console.error('Error in skill verification:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};