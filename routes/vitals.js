const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validateRequest } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const controller = require('../controllers/vitalController');

const vitalSchema = Joi.object({
  patient: Joi.string().required(),
  timestamp: Joi.date().optional(),
  bloodPressure: Joi.object({
    systolic: Joi.number().optional(),
    diastolic: Joi.number().optional()
  }).optional(),
  sugarMgDl: Joi.number().optional(),
  pulse: Joi.number().optional(),
  notes: Joi.string().optional()
});

router.post('/', protect, validateRequest(vitalSchema), controller.addVital);
router.put('/:id', protect, controller.updateVital);

router.get('/patient/:patientId', protect, controller.getVitalsForPatient);
router.get('/patient/:patientId/stats', protect, controller.statsForPatient);

module.exports = router;
