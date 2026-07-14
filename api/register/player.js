const db = require('../../lib/db');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, sport, district } = req.body;

  if (!name || !email || !sport || !district) {
    return res.status(400).json({ error: 'Name, email, sport, and district are required.' });
  }

  const players = db.read('players');

  if (players.find(p => p.email === email)) {
    return res.status(409).json({ error: 'A player with this email already exists.' });
  }

  const player = {
    id: Date.now().toString(),
    name,
    email,
    phone: phone || '',
    sport,
    district,
    registeredAt: new Date().toISOString(),
    tournaments: []
  };

  players.push(player);
  db.write('players', players);

  res.status(201).json({ message: 'Player registered successfully!', player });
};
