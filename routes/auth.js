const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middleware/validate');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login/register requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

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

router.post('/register', apiLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/login', apiLimiter, validateRequest({ body: loginSchema }), authController.login);

module.exports = router;
