const fs = require("fs");
const path = require("path");

module.exports = ctx => {
    let envExamplePath = path.join(__dirname, "../.env.example");
    let envPath = path.join(__dirname, "../.env");
    if (fs.existsSync(envPath) && !ctx.force) {
        return console.log(
            "env file already exists. use --force flag to overwrite it"
        );
    }
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
    }
    console.log("env file created successfully");
    process.exit();
};
