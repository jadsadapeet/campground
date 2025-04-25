const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const i18n = require('i18n')

// Route files
const campgroundRoutes = require('./routes/campgrounds');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');
const reviews = require('./routes/review');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

i18n.configure({
  locales: ['en', 'th', 'zh'],
  directory: __dirname + '/locales',
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang',
  autoReload: true,
  syncFiles: true
});

app.use(i18n.init);


// Body parser & cookie parser
app.use(express.json());
app.use(cookieParser());

// Mount routers
app.use('/api/campgrounds', campgroundRoutes);
app.use('/api/bookings', bookings);
app.use('/api/auth', auth);
app.use('/api/reviews', reviews);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error : ${err.message}`);
  server.close(() => process.exit(1));
});
