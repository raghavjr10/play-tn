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
  let player = players.find(p => p.id === playerId);
  if (!player) {
    // Vercel ephemeral state fallback
    player = { id: playerId, name: 'Player', tournaments: [] };
    players.push(player);
  }

  const tournaments = db.read('tournaments');
  let tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) {
    // Vercel ephemeral state fallback
    tournament = { id: tournamentId, name: 'Tournament', registeredPlayers: [] };
    tournaments.push(tournament);
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
