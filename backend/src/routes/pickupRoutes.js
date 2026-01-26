
const express = require('express');
const {
  createPickup,
  getPickups,
  getPickup,
  updatePickupStatus,
} = require('../controllers/pickupController');
const { protect, authorize } = require('../middleware/auth');

const upload = require('../middleware/upload');

const router = express.Router();

router.use(protect); // All routes protected

const validate = require('../middleware/validate');
const { createPickupSchema } = require('../validators/pickupValidator');

router
  .route('/')
  .post(
      authorize('citizen'), 
      upload.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), 
      validate(createPickupSchema), // Zod validation
      createPickup
  )
  .get(getPickups);

router
  .route('/:id')
  .get(getPickup);

router
  .route('/:id/status')
  .put(authorize('collector', 'admin'), updatePickupStatus);

module.exports = router;
