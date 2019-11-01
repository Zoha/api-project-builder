const { green } = require("chalk");
const templateFile = require("../src/templateFile");
const path = require("path");

module.exports = async modelName => {
    await templateFile(
        path.join(__dirname, "../seeders", modelName + ".js"),
        "seeder",
        {
            model: modelName
        }
    );

    await templateFile(
        path.join(__dirname, "../tests/seeders", modelName + ".test.js"),
        "seederTest",
        {
            model: modelName
        }
    );

    console.log(green(modelName + " seeder was created"));
    process.exit();
};
