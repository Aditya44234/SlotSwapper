
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');
const User = require('../models/User')

exports.authMiddleware = async (req, res, next) => {
    // Get the token from Authorization header :"Bearer "user token

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify and decode token
        const decoded = jwt.verify(token, jwtSecret);
        // Attach user info to request object 
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' })

    }
}