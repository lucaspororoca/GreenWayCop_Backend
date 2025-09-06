const mapService = require('../services/map.service');

exports.getRoute = async (req, res) => {
  try {
    const { localizacao, destino, transporte } = req.body;
    const userId = req.id;

    const route = await mapService.calculateRoute(userId, localizacao, destino, transporte);
    res.status(200).json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};