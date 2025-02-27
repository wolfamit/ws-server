const mongoose = require('mongoose');

const conn = process.env.MONGO_URL;
const db = mongoose.connect('mongodb://localhost:27017/' || conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

module.exports = db;