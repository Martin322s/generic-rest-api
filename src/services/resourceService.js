const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const normalizeResourceName = (resourceName) => resourceName?.toLowerCase().trim();

const buildQuery = (resourceName, ownerId) => {
    const query = { resource: normalizeResourceName(resourceName) };

    if (ownerId) {
        query._ownerId = new mongoose.Types.ObjectId(ownerId);
    }

    return query;
};

exports.create = async ({ resource, payload, ownerId }) =>
    Resource.create({
        resource: normalizeResourceName(resource),
        payload,
        _ownerId: ownerId || undefined
    });

exports.getAll = async ({ resource, ownerId }) =>
    Resource.find(buildQuery(resource, ownerId)).sort({ createdAt: -1 });

exports.getOne = async ({ resource, id }) =>
    Resource.findOne({ _id: id, resource: normalizeResourceName(resource) });

exports.update = async ({ resource, id, payload }) =>
    Resource.findOneAndUpdate(
        { _id: id, resource: normalizeResourceName(resource) },
        { $set: { payload } },
        { new: true }
    );

exports.remove = async ({ resource, id }) =>
    Resource.findOneAndDelete({ _id: id, resource: normalizeResourceName(resource) });
