const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3
    },
    email: {
        type: String,
        required: true,
        validate: function() {
            const regex = new RegExp("^[A-Za-z0-9_\.]+@[A-Za-z]+\.[A-Za-z]{2,3}$");
            return regex.test(this.email);
        }
    },
    imageUrl: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minLength: [6, "The password must be at least 6 characters!"]
    },
    savedResources: [{
        type: mongoose.Types.ObjectId,
        ref: 'Resource'
    }],
    secretWord: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;