const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const skillController = require('../controllers/skills.controller');


router.get('/add', isAuthenticated, isAdmin, skillController.renderAddSkill);
router.get('/', isAuthenticated, skillController.getAllSkills);
router.get('/:id', isAuthenticated, skillController.getSkillById);
router.get('/:id/edit', isAuthenticated, isAdmin, skillController.renderEditSkill);
router.post('/add', isAuthenticated, isAdmin, skillController.createSkill);
router.post('/update-evidence', isAuthenticated, skillController.updateEvidence);
router.put('/:id', isAuthenticated, isAdmin, skillController.updateSkill);
router.delete('/:id', isAuthenticated, isAdmin, skillController.deleteSkill);

router.post('/verify-evidence', isAuthenticated, skillController.verifySkillEvidence);

module.exports = router;
