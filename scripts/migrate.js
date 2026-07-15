require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function readData(file) {
  const filePath = path.join(__dirname, '..', 'data', file);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

async function migrate() {
  console.log('Starting migration to Supabase...');

  // 1. Migrate Organizers
  const organizers = readData('organizers.json');
  console.log(`Found ${organizers.length} organizers.`);
  for (const org of organizers) {
    const { error } = await supabase.from('organizers').insert([{
      name: org.name,
      email: org.email,
      organization: org.organization,
      district: org.district
    }]);
    if (error && error.code !== '23505') console.error('Error inserting org:', error);
  }

  // 2. Migrate Players
  const players = readData('players.json');
  console.log(`Found ${players.length} players.`);
  for (const p of players) {
    const { error } = await supabase.from('players').insert([{
      name: p.name,
      district: p.district || 'Unknown',
      sport: p.sport || 'Unknown'
    }]);
    if (error) console.error('Error inserting player:', error);
  }

  // 3. Migrate Tournaments
  // Note: We skip data migration of tournaments if there are strict foreign key constraints 
  // on organizer_id because the old JSON IDs were timestamps, while Supabase uses UUIDs.
  // We will insert them with organizer_id = null, just keeping the text names.
  const tournaments = readData('tournaments.json');
  console.log(`Found ${tournaments.length} tournaments.`);
  for (const t of tournaments) {
    const { data: insertedT, error } = await supabase.from('tournaments').insert([{
      name: t.name,
      sport: t.sport,
      district: t.district,
      date: t.date,
      venue: t.venue,
      organizer_id: null,
      organizer_name: t.organizerName || 'Legacy',
      organizer_org: t.organizerOrg || 'Legacy'
    }]).select();

    if (error) {
      console.error('Error inserting tournament:', error);
      continue;
    }

    // Since old player IDs are timestamps, we can't easily link them to new UUID players.
    // For a simple app, we can skip migrating the tournament_players junction table
    // or log that they are dropped.
  }

  console.log('Migration complete!');
}

migrate();
