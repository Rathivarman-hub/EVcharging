import Joi from 'joi';

const validator = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors });
  }
  next();
};

export const validateUserInput = validator(Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().optional()
}));

export const validateStationInput = validator(Joi.object({
  name: Joi.string().required(),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
    address: Joi.string().required()
  }).required(),
  totalSlots: Joi.number().min(1).required()
}));

export const validateBookingInput = validator(Joi.object({
  stationId: Joi.string().required(),
  slotId: Joi.string().required(),
  date: Joi.date().iso().required()
}));
