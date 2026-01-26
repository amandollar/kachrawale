
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

module.exports = router;
