const db = require('../../lib/db');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, organization, district } = req.body;

  if (!name || !email || !organization || !district) {
    return res.status(400).json({ error: 'Name, email, organization, and district are required.' });
  }

  const organizers = db.read('organizers');

  if (organizers.find(o => o.email === email)) {
    return res.status(409).json({ error: 'An organizer with this email already exists.' });
  }

  const organizer = {
    id: Date.now().toString(),
    name,
    email,
    phone: phone || '',
    organization,
    district,
    registeredAt: new Date().toISOString()
  };

  organizers.push(organizer);
  db.write('organizers', organizers);

  res.status(201).json({ message: 'Organizer registered successfully!', organizer });
};
