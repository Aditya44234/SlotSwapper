// src/middleware/errorMiddleware.js
module.exports = (err, req, res, next) => {
    // Log error for server-side debugging
    console.error(err);

    // Default status and message
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Optionally expose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }

    // Optionally expose MongoDB duplicate key errors
    if (err.code === 11000) {
        return res.status(409).json({ error: 'Duplicate field value: ' + JSON.stringify(err.keyValue) });
    }

    res.status(statusCode).json({ error: message });
};
