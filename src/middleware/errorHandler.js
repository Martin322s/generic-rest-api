function notFoundHandler(req, res) {
    res.status(404).json({ message: 'Route not found.' });
}

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    const status = Number.isInteger(err.status) ? err.status : 500;
    const message = err.message || 'Internal server error.';

    if (status >= 500) {
        console.error('Unhandled server error:', err);
    }

    res.status(status).json({ message });
}

module.exports = {
    notFoundHandler,
    errorHandler
};
