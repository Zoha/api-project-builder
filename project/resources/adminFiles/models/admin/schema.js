const Schema = require("@src/mongoose").Schema;
const validator = require("validator");
const adminRoles = require("@src/adminRoles");

module.exports = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: value => {
                    return /^(?=.{4,30}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
                        value
                    );
                }
            }
        },
        email: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: validator.isEmail
            }
        },
        name: String,
        bio: String,
        lastLogin: Date,
        lastIp: String,
        role: {
            type: String,
            default: adminRoles[adminRoles.length - 1],
            validate: {
                validator: val => !!adminRoles.includes(val)
            }
        },
        tokens: {
            auth: {
                type: String,
                default: null
            }
        },
        password: {
            type: String,
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);
