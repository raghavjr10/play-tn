const fs = require('fs');
let c = fs.readFileSync('index.html', 'utf8');
c = c.replace("document.getElementById('adminDashboard').style.display = 'block';", "document.getElementById('adminDashboard').style.display = 'block';\n\n        document.getElementById('navMatches').style.display = 'none';\n        document.getElementById('navOrganizers').style.display = 'none';\n        document.getElementById('navLeaderboard').style.display = 'none';");
fs.writeFileSync('index.html', c);
