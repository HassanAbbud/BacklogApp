const mongoose = require('mongoose');
 
// You should name this constant with your mongodb URL 
const URI = 'mongodb+srv://YOUR_DBNAME';

const connectDB = async () => {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
    
    const db = mongoose.connection.db;
    console.log(`Connected to database: ${db.databaseName}`);
    
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;