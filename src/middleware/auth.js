import AuthService from '../services/auth.service.js';

async function authMiddleware(req, res, next) {
    try {
        // Check for authorization header
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }

        // Validate Bearer token format
        const parts = header.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                error: 'Invalid authorization header format'
            });
        }

        const token = parts[1];

        // Verify token using AuthService
        const { valid, expired, decoded } = await AuthService.VerifyToken(token);

        if (!valid) {
            return res.status(401).json({
                error: expired ? 'Token has expired' : 'Invalid token'
            });
        }

        // Set user information in request
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Authentication failed'
        });
    }
}

export default authMiddleware;

