const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    let table = role === 'player' ? 'players' : 'organizers';
    
    // Players don't currently have an email column in our schema.
    // If a player logs in, we might need to check by name instead, or add email to players.
    // Let's assume the frontend passes 'name' as 'email' for players for now, 
    // or we query by 'name' for players and 'email' for organizers.
    const column = role === 'player' ? 'name' : 'email';

    const { data: user, error } = await supabase
      .from(table)
      .select('*')
      .ilike(column, email) // case insensitive match
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }

    return res.status(200).json({ success: true, user, role });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
