const mongoose = require('mongoose');
const { CONNECTION_STRING } = require('./constants');

exports.initializeDatabase = () => {
    mongoose.set('strictQuery', true);
    return mongoose.connect(CONNECTION_STRING);
}