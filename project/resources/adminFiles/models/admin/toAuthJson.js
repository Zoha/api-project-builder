const jwt = require("jsonwebtoken");
const moment = require("moment");
const collect = require("collect.js");

const isTokenValid = token => {
    try {
        jwt.verify(token, process.env.SECRET + "admin");
        return true;
    } catch (e) {
        return false;
    }
};

const shouldWeCreateNewAuthJson = (adminInstance, req) => {
    return (
        !isTokenValid(adminInstance.tokens.auth) ||
        req.ip !== adminInstance.lastIp ||
        moment(adminInstance.updatedAt).isAfter(
            moment(adminInstance.lastLogin).add(1, "seconds")
        )
    );
};

const createAuthJsonFromTokenPayloadAndRequest = (payload, token, req) => {
    return {
        ...collect(payload)
            .except(["exp", "createdAt", "updatedAt"])
            .all(),
        token
    };
};

const createNewAuthJsonAndToken = async (adminInstance, req) => {
    const lasLogin = moment();
    let tokenPayload = {
        _id: adminInstance._id,
        id: adminInstance.id,
        username: adminInstance.username,
        email: adminInstance.email,
        name: adminInstance.name,
        isActive: adminInstance.isActive,
        lastLogin: adminInstance.lasLogin,
        createdAt: adminInstance.createdAt,
        updatedAt: adminInstance.updatedAt,
        role: adminInstance.role,
        exp: moment()
            .add(30, "days")
            .unix()
    };

    let token = jwt.sign(tokenPayload, process.env.SECRET + "admin");

    await adminInstance.updateOne({
        "tokens.auth": token,
        lastLogin: lasLogin,
        lastIp: req.ip
    });

    return createAuthJsonFromTokenPayloadAndRequest(tokenPayload, token, req);
};

const useLastAuthJsonAndToken = (adminInstance, req) => {
    let token = adminInstance.tokens.auth;
    let payload = jwt.decode(token, process.env.SECRET + "admin");
    return createAuthJsonFromTokenPayloadAndRequest(payload, token, req);
};

module.exports = async function(req) {
    if (shouldWeCreateNewAuthJson(this, req)) {
        return await createNewAuthJsonAndToken(this, req);
    } else {
        return useLastAuthJsonAndToken(this, req);
    }
};
