const Campground = require("../models/campground");

// ✅ GET: All campgrounds
exports.getCampgrounds = async (req, res) => {
  try {
    const campgrounds = await Campground.find();

    const reordered = campgrounds.map(camp => ({
      id: camp._id,
      name: camp.name,
      description: camp.description,
      locationName: camp.locationName,
      location: camp.location,
      telephone: camp.telephone,
      price: camp.price,
      features: camp.features,
      image: camp.image,
      rating: camp.rating,
      numReviews: camp.numReviews,
      createdAt: camp.createdAt
    }));

    res.status(200).json({ success: true, message: req.__('campgrounds_fetched'), count: reordered.length, data: reordered });
  } catch (err) {
    res.status(500).json({ success: false, message: req.__('server_error'), error: err.message });
  }
};

// ✅ GET: Single campground by ID
exports.getCampground = async (req, res) => {
  try {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
      return res.status(404).json({ success: false, message: req.__('campground_not_found') });
    }

    const reordered = {
      id: camp._id,
      name: camp.name,
      description: camp.description,
      locationName: camp.locationName,
      location: camp.location,
      telephone: camp.telephone,
      price: camp.price,
      features: camp.features,
      image: camp.image,
      rating: camp.rating,
      numReviews: camp.numReviews,
      createdAt: camp.createdAt
    };

    res.status(200).json({ success: true, message: req.__('campground_fetched'), data: reordered });
  } catch (err) {
    res.status(500).json({ success: false, message: req.__('server_error'), error: err.message });
  }
};

// ✅ POST: Create a new campground
exports.createCampground = async (req, res) => {
  try {
    const campground = await Campground.create({
      ...req.body,
      user: req.user.id
    });

    res.status(201).json({ success: true, message: req.__('campground_created'), data: campground });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: req.__('bad_request'), error: err.message });
  }
};

// ✅ PUT: Update campground
exports.updateCampground = async (req, res) => {
  try {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!campground) {
      return res.status(404).json({ success: false, message: req.__('campground_not_found') });
    }
    res.status(200).json({ success: true, message: req.__('campground_updated'), data: campground });
  } catch (err) {
    res.status(400).json({ success: false, message: req.__('bad_request'), error: err.message });
  }
};

// ✅ DELETE: Delete campground
exports.deleteCampground = async (req, res) => {
  try {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    if (!campground) {
      return res.status(404).json({ success: false, message: req.__('campground_not_found') });
    }
    res.status(200).json({ success: true, message: req.__('campground_deleted') });
  } catch (err) {
    res.status(500).json({ success: false, message: req.__('server_error'), error: err.message });
  }
};

// ✅ GET: Campgrounds near a location
exports.getNearbyCampgrounds = async (req, res) => {
  const { lat, lng, distance } = req.query;

  if (!lat || !lng || !distance) {
    return res.status(400).json({ success: false, message: req.__('missing_location_info') });
  }

  const radius = parseFloat(distance) * 1000;

  try {
    const camps = await Campground.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius
        }
      }
    });

    const reordered = camps.map(camp => ({
      id: camp._id,
      name: camp.name,
      description: camp.description,
      locationName: camp.locationName,
      location: camp.location,
      telephone: camp.telephone,
      price: camp.price,
      features: camp.features,
      image: camp.image,
      rating: camp.rating,
      numReviews: camp.numReviews,
      createdAt: camp.createdAt
    }));

    res.status(200).json({ success: true, message: req.__('campgrounds_nearby_fetched'), count: reordered.length, data: reordered });
  } catch (err) {
    res.status(500).json({ success: false, message: req.__('server_error'), error: err.message });
  }
};
