module.exports = roles => {
    if (!Array.isArray(roles)) {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(400).json({
                message: "you have not permission to do this action"
            });
        }
        next();
    };
};
