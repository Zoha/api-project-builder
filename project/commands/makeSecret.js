const fs = require("fs");
const path = require("path");
const { generateHash } = require("random-hash");

const createSecret = () => {
    return generateHash({
        length: 32,
        charset:
            "abcdefghijkopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV01234567890!@#$%^&*"
    });
};

const changeSecretInFile = async (path, secret) => {
    if (fs.existsSync(path)) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, "utf8", (err, content) => {
                if (err) return reject(err);
                let newContent = content.replace(
                    /\nSECRET="?.+"?/,
                    `\nSECRET="${secret}"`
                );
                fs.writeFile(path, newContent, "utf8", err => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        });
    }
};

module.exports = async ctx => {
    let envExamplePath = path.join(__dirname, "../.env.example");
    let envPath = path.join(__dirname, "../.env");

    const secret = createSecret();

    await changeSecretInFile(envExamplePath, secret);
    await changeSecretInFile(envPath, secret);

    console.log("secret regenerated successfully");
    process.exit();
};
