const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WasteRate = require('./src/models/WasteRate');
const connectDB = require('./src/config/db');

dotenv.config();

const seedRates = async () => {
  try {
    await connectDB();

    const standardRates = [
      { name: 'Newspaper', price: 14, category: 'Paper', description: 'Old newspapers', unit: 'kg' },
      { name: 'Plastic Bottles', price: 22, category: 'Plastic', description: 'PET bottles', unit: 'kg' },
      { name: 'Mixed Metals', price: 35, category: 'Metal', description: 'Iron, Steel mix', unit: 'kg' },
      { name: 'E-Waste', price: 180, category: 'E-Waste', description: 'Electronic boards', unit: 'kg' },
      { name: 'Cardboard', price: 5, category: 'Paper', description: 'Cartons', unit: 'kg' },
      { name: 'Iron', price: 26, category: 'Metal', description: 'Rods/Sheets', unit: 'kg' },
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
