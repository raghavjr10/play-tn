const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data: players, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch players' });
    }

    return res.json(players);
  }

  res.status(405).json({ error: 'Method not allowed' });
};
