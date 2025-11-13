const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
  const payload = req.body;
  const { error } = schema.validate(payload, { abortEarly: false, allowUnknown: false });
  if (error) {
    const errors = error.details.map(d => d.message);
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { validateRequest };
