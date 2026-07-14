const db = require('../../../lib/db');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerId } = req.body;
  const tournamentId = req.query.id;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required.' });
  }

  const players = db.read('players');
  const player = players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found.' });
  }

  const tournaments = db.read('tournaments');
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found.' });
  }

  if (tournament.registeredPlayers.includes(playerId)) {
    return res.status(409).json({ error: 'Player already registered for this tournament.' });
  }

  tournament.registeredPlayers.push(playerId);
  db.write('tournaments', tournaments);

  if (!player.tournaments) player.tournaments = [];
  player.tournaments.push(tournamentId);
  db.write('players', players);

  res.json({
    message: player.name + ' registered for ' + tournament.name + '!',
    tournament
  });
};
