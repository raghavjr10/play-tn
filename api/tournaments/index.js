const db = require('../../lib/db');

module.exports = function handler(req, res) {
  if (req.method === 'GET') {
    const tournaments = db.read('tournaments');
    return res.json(tournaments);
  }

  if (req.method === 'POST') {
    const { name, sport, district, date, venue, organizerId, organizerName, organizerOrg } = req.body;

    if (!name || !sport || !district || !date || (!organizerId && !organizerName)) {
      return res.status(400).json({ error: 'Name, sport, district, date, and organizer are required.' });
    }

    const organizers = db.read('organizers');
    let finalOrgName = organizerName || 'Unknown Organizer';
    let finalOrgOrg = organizerOrg || 'Unknown Org';

    if (organizerId) {
       const organizer = organizers.find(o => o.id === organizerId);
       if (organizer) {
         finalOrgName = organizer.name;
         finalOrgOrg = organizer.organization;
       }
    }

    const tournaments = db.read('tournaments');

    const tournament = {
      id: Date.now().toString(),
      name,
      sport,
      district,
      date,
      venue: venue || 'TBA',
      organizerId,
      organizerName: finalOrgName,
      organizerOrg: finalOrgOrg,
      registeredPlayers: [],
      createdAt: new Date().toISOString()
    };

    tournaments.push(tournament);
    db.write('tournaments', tournaments);

    return res.status(201).json({ message: 'Tournament created successfully!', tournament });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
