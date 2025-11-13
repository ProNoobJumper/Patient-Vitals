const Joi = require('joi');

const validateRequest = (schema) => (req, res, next) => {
  const validationSchema = Joi.object(schema);

  const { error } = validationSchema.validate(
    {
      body: req.body,
      query: req.query,
      params: req.params
    },
    { abortEarly: false, allowUnknown: true }
  );

  if (error) {
    const errors = error.details.map(d => d.message);
    return res.status(400).json({ errors });
  }
  next();
};

module.exports = { validateRequest };
