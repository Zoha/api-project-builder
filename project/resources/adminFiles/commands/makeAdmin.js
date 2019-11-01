const adminSeeder = require("@seeders/admin");
const { green, gray, blue } = require("chalk");
const bcrypt = require("bcryptjs");
const adminRoles = require("@src/adminRoles");

module.exports = async ctx => {
    const username = ctx.username || "admin";
    const password = ctx.password || "secret";
    const role = ctx.role || adminRoles[adminRoles.length - 1];
    const email = ctx.email;
    const name = ctx.name;
    await adminSeeder({
        username,
        role,
        password: bcrypt.hashSync(password),
        ...(email ? { email } : {}),
        ...(name ? { name } : {})
    });
    console.log(green("admin was created"));
    console.log(gray("username :") + blue(username));
    console.log(gray("password :") + blue(password));
    console.log(gray("role :") + blue(role));
    process.exit();
};
