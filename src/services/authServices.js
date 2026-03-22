const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const jwtSign = promisify(jwt.sign);
const { SALT_ROUNDS, SECRET } = require('../../config/constants');

exports.registerUser = async (userData) => {
    const user = await User.findOne({ email: userData.email, firstName: userData.firstName });

    if (user) {
        return "User with this email already exists!";
    } else {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const password = await bcrypt.hash(userData.password, salt);
        const user = await User.create({ ...userData, password: password });
        return user;
    }
};

exports.loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email: email });

    if (!user) {
        return "User not found!";
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return "Invalid email or password!";
    } else {
        return user;
    }
};

exports.generateToken = async (userData) => {
    const token = await jwtSign({ _id: userData._id }, SECRET, { expiresIn: '2h' });
    return token;
};

exports.getAuthor = async (userId) => await User.findById({ _id: userId });
exports.getUser = async (userId) => await User.findById({ _id: userId }).populate('savedResources');
exports.saveResource = async (userId, data) =>
    await User.findByIdAndUpdate({ _id: userId }, { $push: { savedResources: data } }).populate('savedResources');
exports.resetPassword = async (userId, userData, password) => {
    const passwordReset = await bcrypt.hash(password, SALT_ROUNDS);
    userData.password = passwordReset;
    const newUser = await User.findByIdAndUpdate({ _id: userId }, userData, { new: true });
    return newUser;
};
exports.getByEmail = async (email) => {
    const user = await User.find({ email: email });
    if (user.length === 0) {
        return { message: "User not found!" };
    } else {
        return user;
    };
};

exports.unsave = async (userId, data) =>
    await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { savedResources: data } },
        { new: true }
    );

exports.deleteUser = async (userId) => await User.findByIdAndDelete({ _id: userId });
exports.updateUser = async (userId, userData) => 
    await User.findByIdAndUpdate({ _id: userId }, userData);