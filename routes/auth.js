const express = require('express');
const router = express.Router();
const { validateRequest } = require('../middleware/validate');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const authController = require('../controllers/authController');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.AUTH_RATE_LIMIT_MAX ? parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) : 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', apiLimiter, validateRequest({ body: registerSchema }), authController.register);
router.post('/login', apiLimiter, validateRequest({ body: loginSchema }), authController.login);
router.get('/get-doctor', authController.getDoctor);

module.exports = router;
