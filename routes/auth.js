const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middleware/validate');
const Joi = require('joi');

const authController = require('../controllers/authController');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('doctor','patient').required(),
  doctorId: Joi.string().optional(),
  patientInfo: Joi.object().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);

module.exports = router;
