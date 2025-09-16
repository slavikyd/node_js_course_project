const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crudapp',
  nodeEnv: process.env.NODE_ENV || 'development'
};