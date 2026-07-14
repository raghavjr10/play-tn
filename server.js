const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html and other static files

// ── Data file paths ──
const DATA_DIR = path.join(__dirname, 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const ORGANIZERS_FILE = path.join(DATA_DIR, 'organizers.json');
const TOURNAMENTS_FILE = path.join(DATA_DIR, 'tournaments.json');

// Create data directory and files if they don't exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(PLAYERS_FILE)) fs.writeFileSync(PLAYERS_FILE, '[]');
if (!fs.existsSync(ORGANIZERS_FILE)) fs.writeFileSync(ORGANIZERS_FILE, '[]');
if (!fs.existsSync(TOURNAMENTS_FILE)) fs.writeFileSync(TOURNAMENTS_FILE, '[]');

// ── Helper: read/write JSON ──
function readJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ══════════════════════════════════════
// API ROUTES
// ══════════════════════════════════════

// ── Register a Player ──
app.post('/api/register/player', (req, res) => {
  const { name, email, phone, sport, district } = req.body;

  if (!name || !email || !sport || !district) {
    return res.status(400).json({ error: 'Name, email, sport, and district are required.' });
  }

  const players = readJSON(PLAYERS_FILE);

  // Check duplicate email
  if (players.find(p => p.email === email)) {
    return res.status(409).json({ error: 'A player with this email already exists.' });
  }

  const player = {
    id: Date.now().toString(),
    name,
    email,
    phone: phone || '',
    sport,
    district,
    registeredAt: new Date().toISOString(),
    tournaments: [] // tournament IDs this player registered for
  };

  players.push(player);
  writeJSON(PLAYERS_FILE, players);

  res.status(201).json({ message: 'Player registered successfully!', player });
});

// ── Register an Organizer ──
app.post('/api/register/organizer', (req, res) => {
  const { name, email, phone, organization, district } = req.body;

  if (!name || !email || !organization || !district) {
    return res.status(400).json({ error: 'Name, email, organization, and district are required.' });
  }

  const organizers = readJSON(ORGANIZERS_FILE);

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
  writeJSON(ORGANIZERS_FILE, organizers);

  res.status(201).json({ message: 'Organizer registered successfully!', organizer });
});

// ── Get all Players ──
app.get('/api/players', (req, res) => {
  const players = readJSON(PLAYERS_FILE);
  res.json(players);
});

// ── Get all Organizers ──
app.get('/api/organizers', (req, res) => {
  const organizers = readJSON(ORGANIZERS_FILE);
  res.json(organizers);
});

// ── Create a Tournament (by organizer) ──
app.post('/api/tournaments', (req, res) => {
  const { name, sport, district, date, venue, organizerId } = req.body;

  if (!name || !sport || !district || !date || !organizerId) {
    return res.status(400).json({ error: 'Name, sport, district, date, and organizerId are required.' });
  }

  // Verify organizer exists
  const organizers = readJSON(ORGANIZERS_FILE);
  const organizer = organizers.find(o => o.id === organizerId);
  if (!organizer) {
    return res.status(404).json({ error: 'Organizer not found.' });
  }

  const tournaments = readJSON(TOURNAMENTS_FILE);

  const tournament = {
    id: Date.now().toString(),
    name,
    sport,
    district,
    date,
    venue: venue || 'TBA',
    organizerId,
    organizerName: organizer.name,
    organizerOrg: organizer.organization,
    registeredPlayers: [],
    createdAt: new Date().toISOString()
  };

  tournaments.push(tournament);
  writeJSON(TOURNAMENTS_FILE, tournaments);

  res.status(201).json({ message: 'Tournament created successfully!', tournament });
});

// ── Get all Tournaments ──
app.get('/api/tournaments', (req, res) => {
  const tournaments = readJSON(TOURNAMENTS_FILE);
  res.json(tournaments);
});

// ── Player registers for a Tournament ──
app.post('/api/tournaments/:id/register', (req, res) => {
  const { playerId } = req.body;
  const tournamentId = req.params.id;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required.' });
  }

  // Find player
  const players = readJSON(PLAYERS_FILE);
  const player = players.find(p => p.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found.' });
  }

  // Find tournament
  const tournaments = readJSON(TOURNAMENTS_FILE);
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) {
    return res.status(404).json({ error: 'Tournament not found.' });
  }

  // Check if already registered
  if (tournament.registeredPlayers.includes(playerId)) {
    return res.status(409).json({ error: 'Player already registered for this tournament.' });
  }

  // Register
  tournament.registeredPlayers.push(playerId);
  writeJSON(TOURNAMENTS_FILE, tournaments);

  // Also track in player record
  if (!player.tournaments) player.tournaments = [];
  player.tournaments.push(tournamentId);
  writeJSON(PLAYERS_FILE, players);

  res.json({
    message: `${player.name} registered for ${tournament.name}!`,
    tournament
  });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`\n  🏏 Play TN server running at http://localhost:${PORT}\n`);
});
