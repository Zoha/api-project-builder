const { red, info, green } = require("chalk");
const templateFile = require("../src/templateFile");
const path = require("path");
const fs = require("fs");

module.exports = async modelName => {
    await templateFile(
        path.join(__dirname, "../models", modelName + ".js"),
        "model",
        {
            model: modelName,
            modelUpperCase:
                modelName.charAt(0).toUpperCase() + modelName.slice(1)
        }
    );

    fs.mkdirSync(path.join(__dirname, "../models/" + modelName));

    await templateFile(
        path.join(__dirname, "../models", modelName, "schema.js"),
        "modelSchema"
    );

    console.log(green(modelName + " model was created"));
};
