const { red, info, green } = require("chalk");

module.exports = async (modelName, count, options) => {
    if (!options.new) {
        const model = require("@models/" + modelName);
        await model.deleteMany();
        if (model.resetCount) model.resetCount();
    }
    await require("@seeders/" + modelName)(parseInt(count));
    console.log(green(modelName + " seeded"));
    process.exit();
};
