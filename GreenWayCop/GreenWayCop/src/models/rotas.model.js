const db = require('../config/db');

exports.getRouteById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM rotas WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

exports.getUserRoutes = (userId) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM rotas WHERE userId = ?', [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};