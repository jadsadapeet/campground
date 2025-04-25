const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  deleteBooking
} = require('../controllers/booking');

const { protect, authorize } = require('../middleware/auth');

//  POST /:campgroundId
router.route('/:campgroundId')
  .post(protect, createBooking);

// เพิ่ม route GET ทั้งหมด (admin เท่านั้น)
router.route('/')
  .get(protect, authorize('admin'), getAllBookings);

// แก้ไข/ลบ booking
router.route('/:id')  // ใช้ path ที่ชัดเจนกว่า
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

// ดู booking ของตัวเอง
router.get('/me', protect, getMyBookings);


module.exports = router;
