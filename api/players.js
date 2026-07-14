const db = require('../lib/db');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const players = db.read('players');
  res.json(players);
};
