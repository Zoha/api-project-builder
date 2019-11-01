const { blue, gray, red, green } = require("chalk");
const path = require("path");
const fs = require("fs");
var ncp = require("ncp").ncp;
const filesToInjectVariables = require("../filesToInjectVariables");
const { generateHash } = require("random-hash");
const spawn = require("cross-spawn");

const createProjectFolder = async projectFolder => {
    console.log(gray("creating project folder to : " + projectFolder));

    if (fs.existsSync(projectFolder)) {
        throw new Error("project folder already exists");
    }
    fs.mkdirSync(projectFolder);

    console.log(green("project folder created : " + projectFolder));
};

const copyProjectContentToProjectFolder = async projectFolder => {
    console.log(gray("creating basic content..."));

    return new Promise((resolve, reject) => {
        ncp(path.join(__dirname, "../project"), projectFolder, function(err) {
            if (err) return reject(err);
            console.log(green("basic content created successfully"));
            resolve();
        });
    });
};

const injectVariables = async (name, projectFolder) => {
    console.log(gray("injecting variables..."));

    let variables = {
        name: name,
        secret: generateHash({
            length: 32,
            charset:
                "abcdefghijkopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV01234567890!@#$%^&*"
        })
    };
    for (let file of filesToInjectVariables) {
        let filePath = path.join(projectFolder, file);
        if (fs.existsSync(filePath)) {
            await new Promise((resolve, reject) => {
                fs.readFile(filePath, "utf8", (err, fileContent) => {
                    if (err) {
                        return reject(err);
                    }
                    for (let variable in variables) {
                        let regex = new RegExp(
                            `\\$${variable.toUpperCase()}\\$`,
                            "g"
                        );
                        fileContent = fileContent.replace(
                            regex,
                            variables[variable]
                        );
                    }
                    fs.writeFile(filePath, fileContent, "utf8", function(err) {
                        if (err) return reject(err);
                        resolve();
                    });
                });
            });
        }
    }

    console.log(green("variables are injected"));
};

const copyEnvFile = async projectFolder => {
    console.log(gray("copy env file..."));

    await new Promise((resolve, reject) => {
        fs.copyFile(
            path.join(projectFolder, ".env.example"),
            path.join(projectFolder, ".env"),
            err => {
                if (err) return reject(err);
                resolve();
            }
        );
    });

    console.log(green("env file copied"));
};

const copyGitignoreFile = async projectFolder => {
    console.log(gray("copy gitignore file..."));

    await new Promise((resolve, reject) => {
        fs.copyFile(
            path.join(__dirname, "../project", ".gitignore"),
            path.join(projectFolder, ".gitignore"),
            err => {
                if (err) return reject(err);
                resolve();
            }
        );
    });

    console.log(green("gitignore file copied"));
};

const installPackages = async folderName => {
    console.log(gray("installing packages..."));
    return new Promise((resolve, reject) => {
        let command = "npm";
        let args = ["install", "--save", "--loglevel", "error"];

        const child = spawn(command, args, {
            cwd: folderName,
            stdio: "inherit"
        });
        child.on("error", err => {
            reject(err);
        });
        child.on("close", code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(" ")}`
                });
                return;
            }
            console.log(green("packages are installed successfully"));

            resolve();
        });
    });
};

module.exports = async (name, folderName, ctx) => {
    try {
        console.log(blue("--welcome to api project builder--"));
        console.log();
        console.log(gray(`> creating ${name} project...`));
        folderName = folderName || name;

        let projectFolder = path.resolve(folderName);

        await createProjectFolder(projectFolder);
        await copyProjectContentToProjectFolder(projectFolder);
        await injectVariables(name, projectFolder);
        await copyEnvFile(projectFolder);
        await copyGitignoreFile(projectFolder);

        console.log(
            gray("---------------- installing packages ----------------")
        );

        await installPackages(folderName);

        console.log();

        console.log("done");
    } catch (e) {
        console.log();
        console.log(red("an error happened in creating project"));
        console.log(red(e.message));
        console.log();
        console.error(e);
    }
};
