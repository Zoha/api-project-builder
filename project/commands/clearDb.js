const fs = require("fs");
const path = require("path");
const { green } = require("chalk");

module.exports = async model => {
    let models = [];
    if (model) {
        models = [model];
    } else {
        let files = fs.readdirSync(path.join(__dirname, "../models"));
        files = files
            .filter(i => /\.js$/.test(i))
            .map(i => i.replace(/\.js$/, ""));
        models = files;
    }
    const queries = [];
    for (let modelName of models) {
        let model = require("../models/" + modelName);
        queries.push(model.deleteMany({}));
    }
    await Promise.all(queries);
    for (let modelName of models) {
        console.log(green(modelName + " was cleared"));
    }
    process.exit();
};
