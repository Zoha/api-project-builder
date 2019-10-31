const faker = require("faker");
const bcrypt = require("bcryptjs");
const Model = require("@models/admin");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const adminRoles = require("@src/adminRoles");

module.exports = async (custom = {}, count = 1) => {
    if (typeof custom === "number") {
        count = custom;
        custom = {};
    }

    let created = [];
    for (let i = 0; i < count; i++) {
        let ip = faker.internet.ip;
        let data = {
            username: faker.internet.userName(),
            email: faker.internet.email(),
            name: faker.name.findName(),
            bio: faker.lorem.text(),
            lastLogin: moment(),
            lastIp: ip,
            role: faker.random.arrayElement(adminRoles),
            tokens: {
                auth: ""
            },
            password: bcrypt.hashSync("secret", 10),
            isActive: true,
            isDeleted: false,
            ...custom
        };
        let admin = await Model.create(data);
        await admin.toAuthJson(admin, {
            ip: "::1"
        });
        admin = await Model.findOne({ _id: admin._id });

        created.push(admin);
    }

    return created.length > 1 ? created : created[0];
};
