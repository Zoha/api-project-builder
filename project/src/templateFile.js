const fs = require("fs");
const path = require("path");

module.exports = async (destination, templateName, data) => {
    let templatePath = path.join(
        __dirname,
        `../resources/fileTemplates/${templateName}.temp`
    );

    // read template file
    if (!fs.existsSync(templatePath)) {
        return Promise.reject("template not exits");
    }

    await new Promise((resolve, reject) => {
        let file = fs.readFile(templatePath, "utf8", (err, file) => {
            if (err) return reject(err);

            // set data in the file
            for (let dataKey in data) {
                let dataRegex = new RegExp("{{" + dataKey + "}}", "g");
                file = file.replace(dataRegex, data[dataKey]);
            }

            fs.writeFile(destination, file, err => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};
