const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data: organizers, error } = await supabase
      .from('organizers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch organizers' });
    }

    return res.json(organizers);
  }

  res.status(405).json({ error: 'Method not allowed' });
};
