const supabase = require('../../lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { data: tournaments, error } = await supabase
      .from('tournaments')
      .select('*, tournament_players(player_id)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch tournaments', details: error });
    }

    // Map tournament_players to registeredPlayers array to match frontend expectation
    const formattedTournaments = tournaments.map(t => ({
      ...t,
      registeredPlayers: t.tournament_players.map(tp => tp.player_id)
    }));

    return res.json(formattedTournaments);
  }

  if (req.method === 'POST') {
    const { name, sport, district, date, venue, organizerId, organizerName, organizerOrg } = req.body;

    if (!name || !sport || !district || !date || (!organizerId && !organizerName)) {
      return res.status(400).json({ error: 'Name, sport, district, date, and organizer are required.' });
    }

    let finalOrgName = organizerName || 'Unknown Organizer';
    let finalOrgOrg = organizerOrg || 'Unknown Org';

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validOrganizerId = organizerId && uuidRegex.test(organizerId) ? organizerId : null;

    if (validOrganizerId) {
       const { data: organizer } = await supabase.from('organizers').select('*').eq('id', validOrganizerId).single();
       if (organizer) {
         finalOrgName = organizer.name;
         finalOrgOrg = organizer.organization;
       }
    }

    const { data, error } = await supabase
      .from('tournaments')
      .insert([
        { 
          name, 
          sport, 
          district, 
          date, 
          venue: venue || 'TBA', 
          organizer_id: validOrganizerId, 
          organizer_name: finalOrgName, 
          organizer_org: finalOrgOrg,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create tournament' });
    }

    const newTournament = { ...data[0], registeredPlayers: [] };
    return res.status(201).json({ message: 'Tournament created successfully!', tournament: newTournament });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
