// db/connectDB.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
    console.log(`${process.env.MONGO_URI}/${process.env.DB_NAME}`);
    console.log(`✅ MongoDB Connected | Host: ${connection.connection.host} | DB: ${connection.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
