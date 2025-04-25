const Review = require('../models/Review');
const Campground = require('../models/campground');
const Booking = require('../models/Booking');

// ✅ POST /api/reviews/:campgroundId - Create a review
exports.createReview = async (req, res) => {
    const { title, comment, rating } = req.body;
    const campgroundId = req.params.campgroundId;

    try {
        const campground = await Campground.findById(campgroundId);
        if (!campground) {
            return res.status(404).json({
                success: false,
                message: req.__('campground_not_found')
            });
        }

        const existingReview = await Review.findOne({
            campground: campgroundId,
            user: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: req.__('already_reviewed')
            });
        }

        // ✅ ตรวจว่าผู้ใช้เคยจองแคมป์นี้ก่อนถึงจะรีวิวได้
        const hasBooked = await Booking.findOne({
            user: req.user.id,
            campground: campgroundId
        });

        if (!hasBooked) {
            return res.status(400).json({
                success: false,
                message: req.__('must_book_before_review')
            });
        }

        const review = await Review.create({
            title,
            comment,
            rating,
            campground: campgroundId,
            user: req.user.id
        });

        const updatedCampground = await Campground.findById(campgroundId).select('rating numReviews');
        
        res.status(201).json({
            success: true,
            message: req.__('review_created'),
            data: {
                review,
                rating: updatedCampground.rating,
                numReviews: updatedCampground.numReviews
  }
});

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ✅ GET /api/reviews/:campgroundId - Get all reviews for a campground
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            campground: req.params.campgroundId
        }).populate('user', 'name');

        res.status(200).json({
            success: true,
            message: req.__('reviews_fetched'),
            count: reviews.length,
            data: reviews
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ✅ DELETE /api/reviews/:id - Delete a review (by owner or admin)
exports.deleteReview = async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
  
      if (!review) {
        return res.status(404).json({
          success: false,
          message: req.__('review_not_found')
        });
      }
  
      const isOwner = review.user.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
  
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: req.__('not_authorized_review_delete')
        });
      }
  
      // 🔥 ลบรีวิว
      await Review.findByIdAndDelete(req.params.id);
  
      // 🔄 อัปเดตคะแนนและจำนวนรีวิวของแคมป์
      await Review.updateCampgroundRating(review.campground);
  
      res.status(200).json({
        success: true,
        message: req.__('review_deleted')
      });
  
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message
      });
    }
  };
  
