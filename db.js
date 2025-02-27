const mongoose = require('mongoose');
require('dotenv').config();

const conn = process.env.MONGO_URL;
console.log(conn);
const connectDB = async () => {
    try {
        await mongoose.connect(conn);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1); // Exit process if connection fails
    }
};

module.exports = connectDB;
