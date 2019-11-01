const templateFile = require("@src/templateFile");
const pluralize = require("pluralize");
const path = require("path");
const fs = require("fs");

module.exports = async (name, ctx) => {
    const schemaFilePath = path.join(
        __dirname,
        "../resources/schema",
        pluralize.singular(name) + ".js"
    );
    if (fs.existsSync(schemaFilePath) && !ctx.force) {
        return console.log(
            "schema already exists. use --force flag to overwrite"
        );
    }
    await templateFile(schemaFilePath, "schema");

    console.log("schema file created successfully");
};
