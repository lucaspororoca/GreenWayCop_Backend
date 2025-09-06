const authService = require('../services/login.service');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'Token não fornecido' });
  }

  authService.verifyToken(token.split(' ')[1])
    .then(decoded => {
      req.userId = decoded.id;
      next();
    })
    .catch(() => {
      res.status(401).json({ error: 'Token inválido' });
    });
};