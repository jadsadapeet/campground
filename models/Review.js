const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  campground: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campground',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ ห้ามรีวิวแคมป์เดิมซ้ำ
ReviewSchema.index({ campground: 1, user: 1 }, { unique: true });

// ✅ อัปเดตรวมคะแนนของแคมป์
ReviewSchema.statics.updateCampgroundRating = async function (campgroundId) {
  const result = await this.aggregate([
    { $match: { campground: campgroundId } },
    {
      $group: {
        _id: '$campground',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await mongoose.model('Campground').findByIdAndUpdate(campgroundId, {
      rating: result[0].avgRating,
      numReviews: result[0].numReviews
    });
  } else {
    await mongoose.model('Campground').findByIdAndUpdate(campgroundId, {
      rating: 0,
      numReviews: 0
    });
  }
};

// ✅ Hook: หลัง save หรือ remove → อัปเดตคะแนน
ReviewSchema.post('save', function () {
  this.constructor.updateCampgroundRating(this.campground);
});

ReviewSchema.post('remove', function () {
  this.constructor.updateCampgroundRating(this.campground);
});

module.exports = mongoose.model('Review', ReviewSchema);
