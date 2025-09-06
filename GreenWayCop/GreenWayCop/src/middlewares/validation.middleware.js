const { body, validationResult } = require('express-validator');

exports.validateMapRequest = [
  body('localizacao').isObject().withMessage('Localização deve ser um objeto'),
  body('localizacao.latitude').isFloat().withMessage('Latitude inválida'),
  body('localizacao.longitude').isFloat().withMessage('Longitude inválida'),
  body('destino').isObject().withMessage('Destino deve ser um objeto'),
  body('destino.idDestino').isInt().withMessage('ID do destino inválido'),
  body('transporte').isIn(['driving', 'walking', 'bicycling', 'transit']).withMessage('Meio de transporte inválido'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];