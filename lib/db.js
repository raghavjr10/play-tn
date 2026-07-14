const fs = require('fs');
const path = require('path');

const DATA_DIR = '/tmp';

function getFilePath(name) {
  return path.join(DATA_DIR, name + '.json');
}

function read(name) {
  const file = getFilePath(name);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return [];
  }
}

function write(name, data) {
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2));
}

module.exports = { read, write };
