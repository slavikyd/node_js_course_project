const mongoose = require('mongoose');
const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crudapp',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here'
};

// Function to connect to MongoDB using mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // force IPv4, avoids IPv6 localhost issues
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err; // propagate error to handle in app.js
  }
};

module.exports = {
  connectDB,
  config,
};
