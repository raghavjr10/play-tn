const supabase = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  // Simple auth check
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Fetch ALL tournaments, including pending
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*, tournament_players(player_id)')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
    
    const formatted = tournaments.map(t => ({
      ...t,
      registeredPlayers: t.tournament_players.map(tp => tp.player_id)
    }));

    return res.json(formatted);
  }

  if (req.method === 'PATCH') {
    // Approve a tournament
    const { id, status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ error: 'Tournament ID and status are required' });
    }

    const { data, error } = await supabase
      .from('tournaments')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to update status' });
    }

    return res.json({ message: 'Tournament status updated', tournament: data[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
