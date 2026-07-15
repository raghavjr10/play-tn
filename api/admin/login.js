module.exports = function handler(req, res) {
  if (req.method === 'POST') {
    const { password } = req.body;
    
    // Check against the environment variable ADMIN_PASSWORD
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      // In a real app we'd use JWTs, but for a simple SPA a success flag is enough 
      // since the client will store it and subsequent requests will pass the password.
      return res.status(200).json({ success: true, message: 'Logged in successfully' });
    } else {
      return res.status(401).json({ error: 'Invalid password' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
