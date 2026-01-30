const mongoose = require('mongoose');
const dotenv = require('dotenv');
const WasteRate = require('../models/WasteRate');

dotenv.config({ path: '../../.env' }); // Adjust path if needed

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/clean-green');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const seedRates = async () => {
    await connectDB();

    const standardRates = [
        { name: 'plastic', price: 15, category: 'Plastic', description: 'General plastic waste' },
        { name: 'metal', price: 30, category: 'Metal', description: 'Mixed metal scrap' },
        { name: 'e-waste', price: 40, category: 'E-Waste', description: 'Electronic waste' },
        { name: 'organic', price: 2, category: 'Organic', description: 'Kitchen waste' },
        { name: 'Newspaper', price: 14, category: 'Paper', description: 'Old newspapers, magazines' },
        { name: 'Cardboard', price: 5, category: 'Paper', description: 'Cartons, boxes' },
        { name: 'Iron', price: 26, category: 'Metal', description: 'Iron rods, sheets' },
        { name: 'Copper', price: 450, category: 'Metal', description: 'Wires, motors' },
    ];

    try {
        await WasteRate.deleteMany({});
        await WasteRate.insertMany(standardRates);
        console.log('Rates Seeded Successfully');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedRates();
