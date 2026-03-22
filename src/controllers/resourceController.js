const router = require('express').Router();
const mongoose = require('mongoose');
const resourceService = require('../services/resourceService');
const asyncHandler = require('../middleware/asyncHandler');
const { httpError } = require('../middleware/httpError');

const RESOURCE_NAME_PATTERN = /^[a-zA-Z0-9-_]+$/;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const ensureValidResource = (resourceName) => {
    if (!RESOURCE_NAME_PATTERN.test(resourceName || '')) {
        throw httpError(400, 'Invalid resource name.');
    }
};

const ensureAuthorized = (headers) => {
    if (!headers['x-authorization']) {
        throw httpError(401, 'Unauthorized - You don\'t have permissions to do that!');
    }
};

router.get('/:resource', asyncHandler(async (req, res) => {
    const { resource } = req.params;
    const { ownerId } = req.query;

    ensureValidResource(resource);

    if (ownerId && !isValidObjectId(ownerId)) {
        throw httpError(400, 'Invalid ownerId.');
    }

    const records = await resourceService.getAll({ resource, ownerId });
    res.json(records);
}));

router.get('/:resource/:id', asyncHandler(async (req, res) => {
    const { resource, id } = req.params;

    ensureValidResource(resource);

    if (!isValidObjectId(id)) {
        throw httpError(400, 'Invalid resource ID.');
    }

    const record = await resourceService.getOne({ resource, id });

    if (!record) {
        throw httpError(404, 'Record not found.');
    }

    res.json(record);
}));

router.post('/:resource', asyncHandler(async (req, res) => {
    const { resource } = req.params;
    const { payload, _ownerId } = req.body;

    ensureAuthorized(req.headers);
    ensureValidResource(resource);

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw httpError(400, 'payload must be an object.');
    }

    if (_ownerId && !isValidObjectId(_ownerId)) {
        throw httpError(400, 'Invalid _ownerId.');
    }

    const record = await resourceService.create({
        resource,
        payload,
        ownerId: _ownerId
    });

    res.status(201).json(record);
}));

router.put('/:resource/:id', asyncHandler(async (req, res) => {
    const { resource, id } = req.params;
    const { payload } = req.body;

    ensureAuthorized(req.headers);
    ensureValidResource(resource);

    if (!isValidObjectId(id)) {
        throw httpError(400, 'Invalid resource ID.');
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw httpError(400, 'payload must be an object.');
    }

    const updated = await resourceService.update({ resource, id, payload });

    if (!updated) {
        throw httpError(404, 'Record not found.');
    }

    res.json(updated);
}));

router.delete('/:resource/:id', asyncHandler(async (req, res) => {
    const { resource, id } = req.params;

    ensureAuthorized(req.headers);
    ensureValidResource(resource);

    if (!isValidObjectId(id)) {
        throw httpError(400, 'Invalid resource ID.');
    }

    const deleted = await resourceService.remove({ resource, id });

    if (!deleted) {
        throw httpError(404, 'Record not found.');
    }

    res.json(deleted);
}));

module.exports = router;
