
const express = require('express');
const { getDashboardStats, getHeatmapData } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All routes require Admin role

router.get('/stats', getDashboardStats);
router.get('/heatmap', getHeatmapData);

// Verification Routes
const { getPendingVerifications, verifyUser, rejectUser } = require('../controllers/adminController');
router.get('/verifications', getPendingVerifications);
router.put('/verify/:id', verifyUser);
router.delete('/reject/:id', rejectUser);

// Payouts Route
const { getCollectorPayouts, getCollectorMyStats } = require('../controllers/adminController');
router.get('/payouts', getCollectorPayouts);

// Collector Routes (Can be moved to separate file later, but keeping here for simplicity as requested "admin routes")
// Note: This needs 'protect' but NOT 'admin' authorize. We will add a flexible route below.
const collectorRouter = express.Router();
collectorRouter.use(protect);
collectorRouter.use(authorize('collector'));
collectorRouter.get('/my-stats', getCollectorMyStats);

module.exports = { router, collectorRouter }; // Exporting both to be mounted in app.js
