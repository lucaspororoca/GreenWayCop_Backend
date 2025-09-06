const authService = require('../services/register.service');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const dados = await authService.authregister(name, email, password);
    res.status(200).json({ dados });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};