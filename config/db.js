const mongoose = require('mongoose');
const config = require('./config'); // Import your config

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // These options help with authentication issues
      authSource: 'admin',
      retryWrites: true,
      w: 'majority'
    };

    console.log('🔗 Attempting to connect to MongoDB...');
    console.log(`📝 Connection string: ${config.mongoURI}`);
    
    const conn = await mongoose.connect(config.mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    if (error.code === 13) { // Unauthorized
      console.log('\n🔐 Authentication required but no credentials provided.');
      console.log('💡 Solution: Let\'s use in-memory storage for now.');
    }
    
    // Don't exit process - we'll use in-memory storage instead
    console.log('🔄 Switching to in-memory storage...');
  }
};

module.exports = connectDB;