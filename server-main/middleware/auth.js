const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).send({ error: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });
        if (!user) {
            return res.status(401).send({ error: 'User not found' });
        }
        req.user = user;
        next();
    } catch (error) {
        console.error("Auth error:", error);
        res.status(401).send({ error: 'Authentication failed' });
    }
};

module.exports = auth; 