// Middleware: "The VIP Bouncer"
// Checks if the user's role matches the allowed roles for a specific route
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // req.profile is set by the authMiddleware before this runs
        if (!req.profile || !allowedRoles.includes(req.profile.role)) {
            return res.status(403).json({
                error: `Forbidden: Your role (${req.profile?.role || 'unknown'}) is not authorized to perform this action.`
            });
        }
        next();
    };
};

module.exports = authorizeRoles;