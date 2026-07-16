const supabase = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, sport, district } = req.body;

  if (!name || !email || !sport || !district) {
    return res.status(400).json({ error: 'Name, email, sport, and district are required.' });
  }

  const { data, error } = await supabase
    .from('players')
    .insert([
      { name, email, phone: phone || null, sport, district }
    ])
    .select();

  if (error) {
    if (error.code === '23505') { // Unique violation on email
      return res.status(409).json({ error: 'A player with this email already exists.' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Database error' });
  }

  return res.status(201).json({ message: 'Player registered successfully!', player: data[0] });
};
