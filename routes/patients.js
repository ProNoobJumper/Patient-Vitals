const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validateRequest } = require('../middleware/validate');
const { protect, authorizeRoles } = require('../middleware/auth');
const controller = require('../controllers/patientController');

router.post('/', protect, authorizeRoles('doctor'), validateRequest({
  body: Joi.object({
    name: Joi.string().required(),
    dob: Joi.date().optional(),
    gender: Joi.string().valid('male','female','other').optional(),
    contact: Joi.string().optional(),
    meta: Joi.object().optional()
  })
}), controller.createPatient);

router.get('/', protect, authorizeRoles('doctor'), controller.getPatientsForDoctor);

router.get('/:id', protect, authorizeRoles('doctor'), controller.getPatientById);
router.put('/:id', protect, authorizeRoles('doctor'), controller.updatePatient);

module.exports = router;
