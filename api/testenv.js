module.exports = function handler(req, res) {
  res.json({ 
    url: process.env.SUPABASE_URL ? 'set' : 'missing', 
    key: process.env.SUPABASE_ANON_KEY ? 'set' : 'missing' 
  });
};
