const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Ensure db.json exists
function ensureDbExists() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [],
      properties: [],
      bookings: [],
      messages: [],
      leases: []
    }, null, 2), 'utf8');
  }
}

function readData() {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON database, resetting file:', error);
    const emptyDb = { users: [], properties: [], bookings: [], messages: [], leases: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(emptyDb, null, 2), 'utf8');
    return emptyDb;
  }
}

function writeData(data) {
  ensureDbExists();
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to JSON database:', error);
    return false;
  }
}

const getCollection = (collectionName) => {
  return {
    find: (filterFn = () => true) => {
      const data = readData();
      return (data[collectionName] || []).filter(filterFn);
    },
    findOne: (filterFn) => {
      const data = readData();
      return (data[collectionName] || []).find(filterFn);
    },
    findById: (id) => {
      const data = readData();
      return (data[collectionName] || []).find(item => item.id === id);
    },
    insert: (item) => {
      const data = readData();
      if (!data[collectionName]) {
        data[collectionName] = [];
      }
      const newItem = {
        id: `${collectionName.substring(0, 1)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        ...item
      };
      data[collectionName].push(newItem);
      writeData(data);
      return newItem;
    },
    update: (id, updates) => {
      const data = readData();
      const list = data[collectionName] || [];
      const index = list.findIndex(item => item.id === id);
      if (index === -1) return null;
      
      const updatedItem = {
        ...list[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      list[index] = updatedItem;
      data[collectionName] = list;
      writeData(data);
      return updatedItem;
    },
    delete: (id) => {
      const data = readData();
      const list = data[collectionName] || [];
      const index = list.findIndex(item => item.id === id);
      if (index === -1) return false;
      
      list.splice(index, 1);
      data[collectionName] = list;
      writeData(data);
      return true;
    }
  };
};

module.exports = {
  getCollection,
  readData,
  writeData
};
