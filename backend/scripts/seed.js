const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Statement = require('../models/Statement');
const mockDb = require('../models/mockDb');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedStatements = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grammar-correction';
    console.log(`Seeding database at: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding.');

    // Clear existing statements
    await Statement.deleteMany();
    console.log('Cleared existing statements.');

    // Prepare seeds from mockDb.initialStatements (we mapped them to match Mongoose schemas)
    const seeds = mockDb.initialStatements.map(s => ({
      _id: s.id, // Keep the same IDs for consistency
      text: s.text,
      corrections: s.corrections,
      explanation: s.explanation,
      errors: s.errors
    }));

    await Statement.insertMany(seeds);
    console.log('Successfully seeded 3 statements.');

    await mongoose.disconnect();
    console.log('MongoDB disconnected. Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedStatements();
