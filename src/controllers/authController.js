const router = require('express').Router();
const mongoose = require('mongoose');
const authService = require('../services/authServices');
const asyncHandler = require('../middleware/asyncHandler');
const { httpError } = require('../middleware/httpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let tokenBlackList = new Set();

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ensureAuthorized = (req) => {
    const token = req.headers['x-authorization'];

    if (!token || tokenBlackList.has(token)) {
        throw httpError(401, 'Unauthorized - You don\'t have permissions to do that!');
    }

    return token;
};

router.post('/register', asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        imageUrl,
        secretWord,
        password,
        rePass } = req.body;

    if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName) || !isNonEmptyString(secretWord)) {
        throw httpError(400, 'firstName, lastName and secretWord are required.');
    }

    if (!isNonEmptyString(imageUrl)) {
        throw httpError(400, 'imageUrl is required.');
    }

    if (!isNonEmptyString(password) || !isNonEmptyString(rePass)) {
        throw httpError(400, 'password and rePass are required.');
    }

    if (password !== rePass) {
        throw httpError(400, 'Passwords do not match');
    }

    if (!EMAIL_PATTERN.test(email || '')) {
        throw httpError(400, 'Email is not valid!');
    }

    const result = await authService.registerUser({
        firstName,
        lastName,
        email,
        imageUrl,
        secretWord,
        password
    });

    if (typeof result === 'string') {
        throw httpError(400, result);
    }

    const token = await authService.generateToken({ _id: result._id });
    res.cookie('session', token);
    res.json({
        _id: result._id,
        email: result.email,
        firstName: result.firstName,
        lastName: result.lastName,
        accessToken: token
    });
}));

router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        throw httpError(400, 'email and password are required.');
    }

    const user = await authService.loginUser({ email, password });

    if (typeof user === 'string') {
        throw httpError(400, user);
    }

    const token = await authService.generateToken({ _id: user._id });
    res.cookie('session', token);
    res.json({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        accessToken: token
    });
}));

router.get('/logout', (req, res) => {
    const token = req.headers['x-authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - You don\'t have permissions to do that!' });
    }

    tokenBlackList.add(token);
    res.clearCookie('session');
    res.json({});
});

router.post('/email-test', asyncHandler(async (req, res) => {
    const { email } = req.body;
    const value = typeof email === 'object' && email ? email.email : email;

    if (!isNonEmptyString(value)) {
        throw httpError(400, 'email is required.');
    }

    const user = await authService.getByEmail(value);

    if (!user.message) {
        res.json(user[0]);
    } else {
        res.json(user);
    }
}));

router.post('/reset', asyncHandler(async (req, res) => {
    const { password, rePass, userId } = req.body;

    if (!isNonEmptyString(password) || !isNonEmptyString(rePass)) {
        throw httpError(400, 'password and rePass are required.');
    }

    if (!isValidObjectId(userId)) {
        throw httpError(400, 'Invalid userId.');
    }

    const user = await authService.getUser(userId);

    if (!user) {
        throw httpError(404, 'User not found.');
    }

    if (password === rePass) {
        await authService.resetPassword(userId, user, password);
        res.json({ message: 'Password successfully reset!' });
        return;
    }

    throw httpError(400, 'Passwords do not match');
}));

router.get('/:userId', asyncHandler(async (req, res) => {
    const id = req.params.userId;

    if (!isValidObjectId(id)) {
        throw httpError(400, 'Invalid userId.');
    }

    const author = await authService.getUser(id);

    if (!author) {
        throw httpError(404, 'User not found.');
    }

    res.json(author);
}));

router.post('/unsave/:userId', asyncHandler(async (req, res) => {
    ensureAuthorized(req);

    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
        throw httpError(400, 'Invalid userId.');
    }

    if (!Array.isArray(req.body)) {
        throw httpError(400, 'Body must be an array of objects with _id fields.');
    }

    const resources = req.body.map((entry) => entry?._id).filter(Boolean);
    const hasInvalidId = resources.some((id) => !isValidObjectId(id));

    if (hasInvalidId) {
        throw httpError(400, 'One or more resource IDs are invalid.');
    }

    const author = await authService.unsave(userId, resources);
    if (!author) {
        throw httpError(404, 'User not found.');
    }

    const user = await authService.getUser(author._id);
    res.json(user?.savedResources || []);
}));

router.delete('/delete/:userId', asyncHandler(async (req, res) => {
    ensureAuthorized(req);

    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
        throw httpError(400, 'Invalid userId.');
    }

    const user = await authService.deleteUser(userId);
    if (!user) {
        throw httpError(404, 'User not found.');
    }

    res.json(user);
}));

router.patch('/update/:userId', asyncHandler(async (req, res) => {
    ensureAuthorized(req);

    const userId = req.params.userId;
    if (!isValidObjectId(userId)) {
        throw httpError(400, 'Invalid userId.');
    }

    const newData = req.body;
    if (!newData || typeof newData !== 'object' || Array.isArray(newData)) {
        throw httpError(400, 'Body must be an object with fields to update.');
    }

    const user = await authService.getAuthor(userId);
    if (!user) {
        throw httpError(404, 'User not found.');
    }

    const updatedUser = await authService.updateUser(userId, Object.assign(user, newData));
    res.json(updatedUser);
}));

module.exports = router;