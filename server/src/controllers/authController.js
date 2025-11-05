const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { jwtSecret } = require('../config/secrets')

//  Utility : Generate JWT token

function generateToken(user) {
    return jwt.sign(
        { userId: user._id, email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
    );
}


exports.signUp = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        //  Check for existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registred' })
        }

        //  Create and save user

        const user = await User.create({ name, email, password });
        const token = generateToken(user);

        res.status(201).json({
            message: 'Registration successfull',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }, token   //  Most important for sign In
        })

    } catch (err) {
        next(err);
    };
};


exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check for password 
        const isMatch = await user.comparePassword(password);

        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken(user);
        res.status(200).json(
            {
                message: 'Login successful ',
                user: { id: user._id, name: user.name, email: user.email }, token
            })
    } catch (err) {
        next(err);
    }
}