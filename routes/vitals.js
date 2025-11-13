const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { validateRequest } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const controller = require('../controllers/vitalController');

const idParamSchema = {
  params: Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid ID format'
    })
  })
};

const patientIdParamSchema = {
  params: Joi.object({
    patientId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Invalid patientId format'
    })
  })
};

const vitalsQuerySchema = {
  ...patientIdParamSchema,
  query: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional(),
    limit: Joi.number().integer().min(1).max(200).default(100)
  }).unknown(true)
};

const statsQuerySchema = {
  ...patientIdParamSchema,
  query: Joi.object({
    from: Joi.date().optional(),
    to: Joi.date().optional()
  }).unknown(true)
};

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

router.post('/', protect, validateRequest({ body: vitalSchema }), controller.addVital);
router.put('/:id', protect, validateRequest(idParamSchema), controller.updateVital);

router.get('/patient/:patientId', protect, validateRequest(vitalsQuerySchema), controller.getVitalsForPatient);
router.get('/patient/:patientId/stats', protect, validateRequest(statsQuerySchema), controller.statsForPatient);

module.exports = router;
