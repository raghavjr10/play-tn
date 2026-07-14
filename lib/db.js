const fs = require('fs');
const path = require('path');

const TMP_DIR = '/tmp';
const DATA_DIR = path.join(__dirname, '../data');

function getTmpPath(name) {
  return path.join(TMP_DIR, name + '.json');
}

function getDataPath(name) {
  return path.join(DATA_DIR, name + '.json');
}

function read(name) {
  try {
    // Try to read from /tmp first (newly created data in current session)
    if (fs.existsSync(getTmpPath(name))) {
      return JSON.parse(fs.readFileSync(getTmpPath(name), 'utf-8'));
    }
    // Fall back to pre-existing data
    if (fs.existsSync(getDataPath(name))) {
      const data = JSON.parse(fs.readFileSync(getDataPath(name), 'utf-8'));
      // Initialize the /tmp file with this data so future writes append to it
      fs.writeFileSync(getTmpPath(name), JSON.stringify(data, null, 2));
      return data;
    }
    return [];
  } catch (err) {
    return [];
  }
}

function write(name, data) {
  fs.writeFileSync(getTmpPath(name), JSON.stringify(data, null, 2));
}

module.exports = { read, write };
