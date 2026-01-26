
const User = require('../models/User');

exports.findBestCollectors = async (pickup) => {
  // Logic: Find collectors within X radius
  // For now: Return all collectors
  // Future: Use $nearSphere with pickup.location.coordinates

  try {
    const collectors = await User.find({ role: 'collector' });
    
    // Check if they are online? (Skipping for MVP)
    
    return collectors;
  } catch (err) {
    console.error('Matching Error:', err);
    return [];
  }
};
