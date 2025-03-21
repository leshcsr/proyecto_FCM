const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middlewares/auth');
const skillController = require('../controllers/skills.controller');


router.get('/add', skillController.renderAddSkill);
router.get('/');
router.get('/:id', skillController.getSkillById);
router.get('/:id/edit',  skillController.renderEditSkill);

router.post('/add', skillController.createSkill);
router.post('/update-evidence',  skillController.updateEvidence);
router.post('/verify-evidence', skillController.verifySkillEvidence);

router.put('/:id', skillController.updateSkill);
router.delete('/:id',  skillController.deleteSkill);


module.exports = router;
