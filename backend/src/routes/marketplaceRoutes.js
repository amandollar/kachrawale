
const express = require('express');
const { getAvailableListings, purchaseListing } = require('../controllers/marketplaceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require login and Recycler role
router.use(protect);
router.use(authorize('recycler'));

router.get('/', getAvailableListings);
router.post('/:id/buy', purchaseListing);

module.exports = router;
