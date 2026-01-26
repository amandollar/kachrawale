const express = require('express');
const { getAllRates, updateRate, deleteRate, seedRates } = require('../controllers/rateController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAllRates)
  .post(protect, authorize('admin', 'admin'), updateRate); // "admin" role twice just to be safe or maybe the middleware expects specific args

router.route('/seed')
    .post(protect, authorize('admin'), seedRates);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteRate);

module.exports = router;
