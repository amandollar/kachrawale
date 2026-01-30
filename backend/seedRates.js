const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WasteRate = require('./src/models/WasteRate');
const connectDB = require('./src/config/db');

dotenv.config();

const seedRates = async () => {
  try {
    await connectDB();

    const standardRates = [
      { name: 'Mixed Paper', price: 8, category: 'Paper', description: 'Newspapers, Cardboard mix', unit: 'kg' },
      { name: 'Mixed Plastic', price: 15, category: 'Plastic', description: 'Bottles, Packaging', unit: 'kg' },
      { name: 'Mixed Metal', price: 30, category: 'Metal', description: 'Iron, Steel, Aluminum mix', unit: 'kg' },
      { name: 'E-Waste', price: 180, category: 'E-Waste', description: 'Electronic boards, Wires', unit: 'kg' },
      { name: 'Glass', price: 2, category: 'Glass', description: 'Bottles, Broken glass', unit: 'kg' },
      { name: 'Organic', price: 5, category: 'Organic', description: 'Compostable waste', unit: 'kg' },
    ];

    await WasteRate.deleteMany({});
    console.log('Cleared existing rates...');

    await WasteRate.insertMany(standardRates);
    console.log('Seeded standard rates!');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedRates();
