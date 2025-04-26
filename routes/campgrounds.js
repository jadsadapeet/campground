const express = require('express');
const router = express.Router();

const {
  getCampgrounds,
  getCampground,
  createCampground,
  updateCampground,
  deleteCampground,
  getNearbyCampgrounds // ✅ รวมฟังก์ชันนี้ด้วย
} = require('../controllers/campground');
const { protect, authorize } = require('../middleware/auth');

// ✅ ต้องมาก่อน /:id
router.get('/near', getNearbyCampgrounds);

// 🔓 Public routes
router.route('/').get(getCampgrounds);
router.route('/:id').get(getCampground);

// 🔐 Protected routes (admin only)
router.route('/').post(protect, authorize('admin'), createCampground);
router.route('/:id')
  .put(protect, authorize('admin'), updateCampground)
  .delete(protect, authorize('admin'), deleteCampground);

module.exports = router;
