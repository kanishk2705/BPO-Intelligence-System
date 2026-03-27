// server/middleware/roleMiddleware.js

// Middleware: "The VIP Bouncer"
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.profile is reliably set by authMiddleware
        if (!req.profile || !allowedRoles.includes(req.profile.role)) {
            return res.status(403).json({
                error: `Forbidden: Your role (${req.profile?.role || 'unknown'}) is not authorized for this action.`
            });
        }
        next();
    };
};

module.exports = authorizeRoles;