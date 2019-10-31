const router = require("express").Router();
const resource = require("rest-schema");
const Admin = require("@models/admin");
const validator = require("validator");
const { required: requiredAdminAuth } = require("@middleware/admin");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const role = require("@middleware/role");
const adminRoles = require("@src/adminRoles");

router.use(
    resource({
        model: Admin,
        fields: {
            username: {
                type: String,
                unique: true,
                required: true,
                sanitize: val => validator.trim(val.toLowerCase()),
                validate: (val, { req }) => {
                    if (req.method.toLowerCase() !== "get") {
                        return /^(?=.{4,30}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
                            val
                        );
                    }
                    return true;
                }
            },
            email: {
                type: String,
                required: true,
                unique: true,
                sanitize: val => validator.trim(val.toLowerCase()),
                validate: validator.isEmail
            },
            name: {
                type: String,
                validate: val => val.length < 50
            },
            bio: {
                type: String,
                validate: val => val.length < 100
            },
            password: {
                type: String,
                filterable: false,
                sortable: false,
                hide: true,
                set: (value, { req, record, type }) => {
                    if (!record || req.body.password) {
                        req.body.password = req.body.password || random(10);
                        return bcrypt.hashSync(req.body.password, 10);
                    }
                    return record.password;
                }
            },
            lastLogin: {
                type: Date,
                filterable: false,
                sortable: false,
                updatable: false,
                set: (value, { req, record, type }) => {
                    if (type === "create") {
                        return moment();
                    } else if (type === "update") {
                        return moment(record.lastLogin);
                    }
                }
            },
            lastIp: {
                type: String,
                filterable: false,
                sortable: false,
                updatable: false,
                set: (value, { req, record, type }) => {
                    if (type === "create") {
                        return req.ip;
                    } else {
                        return record.lastIp;
                    }
                }
            },
            role: {
                type: String,
                validate: val => adminRoles.includes(val)
            },
            isActive: {
                type: Boolean,
                creatable: false
            },
            isDeleted: {
                type: Boolean,
                creatable: false
            },
            createdAt: {
                type: Date,
                updatable: false,
                creatable: false
            },
            updatedAt: {
                type: Date,
                updatable: false,
                creatable: false
            }
        },
        routeKeys: ["id", "username"],
        middleware: {
            global: [requiredAdminAuth, role(adminRoles[0])]
        },
        routes: ["index", "single", "update", "create", "delete", "count"]
    })
);

router.use(require("./login"));
router.use(require("./settings"));

module.exports = router;
