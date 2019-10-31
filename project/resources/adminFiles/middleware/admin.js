const jwt = require("express-jwt");
const secret = process.env.SECRET + "admin";

const getTokenFromRequest = req => {
    if (req.body && req.body.authToken) {
        return req.body.authToken;
    }
    if (req.query.authToken) {
        return req.query.authToken;
    }
    let authentication = req.headers.authorization;
    if (authentication && authentication.split(" ")[0] === "Bearer") {
        return authentication.split(" ")[1];
    }
    return null;
};

const handleAuthError = (err, req, res, next) => {
    res.status(401);
    return next(err);
};

module.exports.required = [
    jwt({
        secret,
        getToken: getTokenFromRequest
    }),
    handleAuthError
];

module.exports.optional = [
    jwt({
        secret,
        credentialsRequired: false,
        getToken: getTokenFromRequest
    }),
    handleAuthError
];
