const mongoose = require('mongoose');

const CampgroundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a campground name'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  locationName: {
    type: String,
    required: [true, 'Please add a location name']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  telephone: {
    type: String,
    required: [true, 'Please add a telephone number']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  image: {
    type: String,
    default: 'no-image.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  features: {
    firepit: { type: Boolean, default: false },
    electricity: { type: Boolean, default: false },
    toilets: { type: Boolean, default: false }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CampgroundSchema.index({ location: '2dsphere' });

// เชื่อมกับ review
CampgroundSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'campground',
  justOne: false
});



module.exports = mongoose.model('Campground', CampgroundSchema);

