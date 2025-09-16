const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB is running
    await mongoose.connect('mongodb://root:example@127.0.0.1:27017/crudapp?authSource=admin');
    console.log('MongoDB Connected Successfully');
    
    // Listen to connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // Close connection on app termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.log('Please make sure MongoDB is running on your system');
    process.exit(1);
  }
};

module.exports = connectDB;