const Booking = require('../models/Booking');
const Campground = require('../models/campground');
const sendEmail = require('../utils/sendEmail');

// @desc    Create booking
// @route   POST /api/bookings/:campgroundId
// @access  Private
exports.createBooking = async (req, res) => {
  const campgroundId = req.params.campgroundId;
  const { dateFrom, dateTo } = req.body;

  try {
    const now = new Date();
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    if (fromDate < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: req.__('cannot_book_past') });
    }

    if (fromDate >= toDate) {
      return res.status(400).json({ success: false, message: req.__('invalid_date_range') });
    }

    const campground = await Campground.findById(campgroundId);
    if (!campground) {
      return res.status(404).json({ success: false, message: req.__('campground_not_found') });
    }

    const booking = await Booking.create({
      user: req.user.id,
      campground: campgroundId,
      dateFrom,
      dateTo
    });

    await sendEmail({
      email: req.user.email,
      subject: req.__('booking_success'),
      message: `${req.__('booking_success')}\nCampground: ${campground.name}\nFrom: ${dateFrom}\nTo: ${dateTo}`
    });

    res.status(201).json({ success: true,message:req.__('booking_created_successfully'), data: booking  });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('campground');
  res.status(200).json({ success: true,message:req.__('my_bookings_fetched'), count: bookings.length, data: bookings });
};

exports.getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: req.__('access_denied') });
    }

    const bookings = await Booking.find().populate('campground user');
    res.status(200).json({ success: true,message:req.__('all_bookings_fetched'), count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: req.__('booking_not_found') });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: req.__('not_authorized') });
    }

    const { dateFrom, dateTo } = req.body;
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const now = new Date();

    if (fromDate < now.setHours(0, 0, 0, 0)) {
      return res.status(400).json({ success: false, message: req.__('cannot_book_past') });
    }

    if (fromDate >= toDate) {
      return res.status(400).json({ success: false, message: req.__('invalid_date_range') });
    }

    const nights = (toDate - fromDate) / (1000 * 60 * 60 * 24);
    if (nights > 3) {
      return res.status(400).json({ success: false, message: req.__('cannot_book_more_than_3_nights') });
    }

    const isOverlapping = await Booking.findOne({
      _id: { $ne: booking._id },
      campground: booking.campground,
      $or: [
        { dateFrom: { $lte: dateTo }, dateTo: { $gte: dateFrom } }
      ]
    });

    if (isOverlapping) {
      return res.status(400).json({
        success: false,
        message: req.__('campground_fully_booked')
      });
    }

    booking.dateFrom = dateFrom;
    booking.dateTo = dateTo;
    await booking.save();

    res.status(200).json({ success: true,message:req.__('booking_updated'), data: booking });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: req.__('booking_not_found') });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: req.__('not_authorized') });
    }

    await booking.deleteOne();

    await sendEmail({
      email: req.user.email,
      subject: req.__('booking_cancel'),
      message: `${req.__('booking_cancel')}\nBooking ID: ${booking._id}`
    });

    res.status(200).json({ success: true, message: req.__('booking_deleted') });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
