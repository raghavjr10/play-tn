const supabase = require('../../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { playerId } = req.body;
  const tournamentId = req.query.id;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required.' });
  }

  // Insert into the junction table
  const { error } = await supabase
    .from('tournament_players')
    .insert([
      { tournament_id: tournamentId, player_id: playerId }
    ]);

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Player already registered for this tournament.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Database error while registering.' });
  }

  // Fetch the tournament to return the updated object (or mock it for the frontend)
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*, tournament_players(player_id)')
    .eq('id', tournamentId)
    .single();

  if (tournament) {
    tournament.registeredPlayers = tournament.tournament_players.map(tp => tp.player_id);
  }

  res.json({
    message: 'Registered successfully!',
    tournament: tournament || { id: tournamentId, registeredPlayers: [playerId] }
  });
};
