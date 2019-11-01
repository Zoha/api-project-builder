const fs = require("fs");
const path = require("path");
const ncp = require("ncp");

module.exports = async ctx => {
    const adminFilesDirectory = path.join(__dirname, "../resources/adminFiles");
    const indexRoutePath = path.join(__dirname, "../routes/index.js");
    const commandsFile = path.join(__dirname, "../command.js");

    if (
        fs.existsSync(path.join(__dirname, "../models/admin.js") && !ctx.force)
    ) {
        return console.log(
            "admin files already exists. use --force flag to overwrite"
        );
    }
    return new Promise((resolve, reject) => {
        ncp(adminFilesDirectory, path.join(__dirname, "../"), err => {
            if (err) return reject(err);
            fs.readFile(indexRoutePath, "utf8", (err, content) => {
                if (err) return reject(err);
                let newContent = content.replace(
                    "// fallback",
                    '\n// admin routes\nrouter.use("/admins",require("./admins"));\n// fallback'
                );
                fs.writeFile(indexRoutePath, newContent, "utf8", err => {
                    if (err) return reject(err);
                    fs.readFile(commandsFile, "utf8", (err, content) => {
                        if (err) return reject(err);
                        let newContent = content.replace(
                            "program.parse(process.argv);",
                            '\nprogram\n\t.command("make:admin")\n\t.option("-u, --username <value>")\n\t.option("-p, --password <value>")\n\t.option("-e, --email <value>")\n\t.option("-n, --name <value>")\n\t.option("-r, --role <value>")\n\t.action(require("@commands/makeAdmin"));\n\nprogram.parse(process.argv);'
                        );
                        fs.writeFile(commandsFile, newContent, "utf8", err => {
                            if (err) return reject(err);
                            resolve();
                            console.log(
                                "admin functionality added successfully"
                            );
                            process.exit();
                        });
                    });
                });
            });
        });
    });
};
