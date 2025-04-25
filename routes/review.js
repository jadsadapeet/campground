const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviews,
  deleteReview
} = require('../controllers/review');

const { protect, authorize } = require('../middleware/auth');

// ✅ ให้เฉพาะผู้ที่ login เท่านั้นที่สามารถรีวิวได้
router
  .route('/:campgroundId') // POST และ GET สำหรับรีวิวของแคมป์
  .post(protect, createReview)
  .get(getReviews);

// ✅ ให้เจ้าของรีวิวหรือ admin ลบได้
router
  .route('/:id')
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
