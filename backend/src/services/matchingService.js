const User = require('../models/User');

/**
 * Finds collectors within a specified radius (default 10km) of a pickup location.
 * @param {Object} pickup - The pickup document containing location coordinates.
 * @returns {Promise<Array>} - List of matching collector documents.
 */
exports.findBestCollectors = async (pickup) => {
  try {
    // Validate pickup and location
    if (!pickup || !pickup.location || !pickup.location.coordinates || pickup.location.coordinates.length < 2) {
      console.warn('Invalid pickup location for matching');
      return [];
    }

    const { coordinates } = pickup.location;
    
    // Max distance in meters (10km)
    const MAX_DISTANCE = 10000;

    const collectors = await User.find({
      role: 'collector',
      isVerified: true, // Only verified collectors
      'address.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          $maxDistance: MAX_DISTANCE,
        },
      },
    });

    return collectors;
  } catch (err) {
    console.error('Matching Error:', err);
    // Fallback: If geo-indexing fails or error occurs, return empty to prevent crash
    return [];
  }
};
