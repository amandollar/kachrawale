const WasteRate = require('../models/WasteRate');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all waste rates
// @route   GET /api/rates
// @access  Public
exports.getAllRates = asyncHandler(async (req, res, next) => {
  const rates = await WasteRate.find().sort({ category: 1, name: 1 });
  res.status(200).json(new ApiResponse(200, rates));
});

// @desc    Create or Update a rate
// @route   POST /api/rates
// @access  Private (Admin)
exports.updateRate = asyncHandler(async (req, res, next) => {
  const { name, price, category, unit, description, icon } = req.body;

  // Check if rate already exists
  let rate = await WasteRate.findOne({ name });

  if (rate) {
    // Update
    rate = await WasteRate.findOneAndUpdate(
      { name },
      { price, category, unit, description, icon, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );
  } else {
    // Create
    rate = await WasteRate.create({
      name,
      price,
      category,
      unit,
      description,
      icon
    });
  }

  res.status(200).json(new ApiResponse(200, rate));
});

// @desc    Delete a rate
// @route   DELETE /api/rates/:id
// @access  Private (Admin)
exports.deleteRate = asyncHandler(async (req, res, next) => {
  const rate = await WasteRate.findById(req.params.id);

  if (!rate) {
    throw new ApiError(404, `Rate not found with id of ${req.params.id}`);
  }

  await rate.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, 'Rate deleted'));
});

// @desc    Seed standard rates
// @route   POST /api/rates/seed
// @access  Private (Admin)
exports.seedRates = asyncHandler(async (req, res, next) => {
  const standardRates = [
    { name: 'plastic', price: 15, category: 'Plastic', description: 'General plastic waste' },
    { name: 'metal', price: 30, category: 'Metal', description: 'Mixed metal scrap' },
    { name: 'e-waste', price: 40, category: 'E-Waste', description: 'Electronic waste' },
    { name: 'organic', price: 2, category: 'Compost', description: 'Kitchen waste' },
    { name: 'Newspaper', price: 14, category: 'Paper', description: 'Old newspapers, magazines' },
    { name: 'Cardboard', price: 5, category: 'Paper', description: 'Cartons, boxes' },
    { name: 'Plastic Bottles', price: 22, category: 'Plastic', description: 'PET bottles, clean' },
    { name: 'Mixed Plastic', price: 12, category: 'Plastic', description: 'Hard plastics, containers' },
    { name: 'Iron', price: 26, category: 'Metal', description: 'Iron rods, sheets' },
    { name: 'Copper', price: 450, category: 'Metal', description: 'Wires, motors' },
    { name: 'Aluminium', price: 110, category: 'Metal', description: 'Cans, utensils' },
    { name: 'Brass', price: 305, category: 'Metal', description: 'Fittings, utensils' },
    { name: 'Steel', price: 35, category: 'Metal', description: 'Utensils' },
    { name: 'E-Waste (Mixed)', price: 30, category: 'E-Waste', description: 'Wires, PCBs, mixed electronics' },
    { name: 'Beer Bottles', price: 2, unit: 'piece', category: 'Glass', description: 'Glass beer bottles' },
  ];

  await WasteRate.deleteMany({}); // Clear existing
  const createdRates = await WasteRate.insertMany(standardRates);

  res.status(201).json(new ApiResponse(201, createdRates, 'Rates seeded successfully'));
});
