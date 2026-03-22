const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
    {
        resource: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            default: {}
        },
        _ownerId: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            index: true
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
