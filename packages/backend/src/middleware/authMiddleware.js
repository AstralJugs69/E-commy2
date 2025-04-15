"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUser = exports.isAdmin = void 0;
// Replace the problematic import with direct require
var jwt = require('jsonwebtoken');
var JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_dev_only'; // Use environment variable or default for development
// Admin authentication middleware
var isAdmin = function (req, res, next) {
    console.log('isAdmin middleware called');
    var authHeader = req.headers.authorization;
    // Check if Authorization header exists and starts with 'Bearer '
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.split(' ')[1]; // Extract token
        console.log('Token found, verifying...');
        console.log('JWT_SECRET exists:', !!JWT_SECRET);
        try {
            // Verify the token
            var decoded = jwt.verify(token, JWT_SECRET);
            console.log('Token verified successfully:', decoded);
            // Attach decoded payload to request object
            req.user = decoded;
            // TODO (Future): Check if the decoded payload corresponds to an admin user in the DB.
            // For MVP V1, just verifying the token is enough to proceed.
            next(); // Token is valid (for MVP), proceed to the route handler
        }
        catch (error) {
            // Token verification failed (invalid or expired)
            console.error('Token verification failed:', error);
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
    else {
        // No token provided
        console.log('No auth token provided in request');
        res.status(401).json({ message: 'Unauthorized: Token required' });
    }
};
exports.isAdmin = isAdmin;
// User authentication middleware - identical to isAdmin for now
// Will be differentiated in future for role-based access
var isUser = function (req, res, next) {
    var authHeader = req.headers.authorization;
    // Check if Authorization header exists and starts with 'Bearer '
    if (authHeader && authHeader.startsWith('Bearer ')) {
        var token = authHeader.split(' ')[1]; // Extract token
        try {
            // Verify the token
            var decoded = jwt.verify(token, JWT_SECRET);
            // Attach decoded payload to request object
            req.user = decoded;
            next(); // Token is valid, proceed to the route handler
        }
        catch (error) {
            // Token verification failed (invalid or expired)
            res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    }
    else {
        // No token provided
        res.status(401).json({ message: 'Unauthorized: Token required' });
    }
};
exports.isUser = isUser;
