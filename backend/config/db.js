const mongoose = require('mongoose');

let isMockMode = false;
let dbInfo = {
  host: null,
  name: null,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grammar-correction'
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbInfo.uri, {
      serverSelectionTimeoutMS: 3000 // 3 seconds timeout to fail fast and fall back
    });
    dbInfo.host = conn.connection.host;
    dbInfo.name = conn.connection.name;
    console.log(`MongoDB Connected: ${dbInfo.host}/${dbInfo.name}`);
    isMockMode = false;
  } catch (error) {
    console.warn('==================================================');
    console.warn('WARNING: Failed to connect to MongoDB database.');
    console.warn(`Attempted URI: ${dbInfo.uri}`);
    console.warn('Switching to local In-Memory / Mock DB Fallback Mode.');
    console.warn('You can test the backend fully without MongoDB running!');
    console.warn('==================================================');
    isMockMode = true;
  }
};

const getDbMode = () => isMockMode;
const getDbInfo = () => ({
  mode: isMockMode ? 'mock' : 'mongodb',
  host: dbInfo.host,
  name: dbInfo.name,
  uri: isMockMode ? null : dbInfo.uri
});

module.exports = { connectDB, getDbMode, getDbInfo };
