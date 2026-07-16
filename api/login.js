const supabase = require('../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    let table = role === 'player' ? 'players' : 'organizers';
    
    let query = supabase.from(table).select('*');
    
    if (role === 'player') {
      // Allow players to log in using either their Name or Email
      query = query.or(`name.ilike.${email},email.ilike.${email}`);
    } else {
      // Organizers must log in using Email
      query = query.ilike('email', email);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }

    return res.status(200).json({ success: true, user, role });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
