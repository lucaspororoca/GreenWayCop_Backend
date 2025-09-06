const authService = require('../services/login.service');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authService.authenticate(email, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};