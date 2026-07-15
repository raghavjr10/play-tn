const supabase = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, email, organization, district } = req.body;

    if (!name || !email || !organization || !district) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const { data, error } = await supabase
      .from('organizers')
      .insert([
        { name, email, organization, district }
      ])
      .select();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({ error: 'An organizer with this email already exists.' });
      }
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(201).json({ message: 'Organizer registered successfully!', organizer: data[0] });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
