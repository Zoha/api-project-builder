const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const config = require("./config");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// init module alias (~, @models, @src,...)
require("./src/moduleAliasInit");

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// file upload middleware
//app.use(fileUpload());

// cross domain
app.use(
    cors({
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",")
            : undefined
    })
);

// morgan middleware
if (config.isDevelopment) {
    app.use(morgan("tiny"));
}

// auto load model files
files = fs.readdirSync(path.join(__dirname, "models"));
for (let file of files.filter(i => /\.js$/.test(i))) {
    require("./models/" + file);
}

// load routes
app.use(require("./routes"));

// error handler
app.use((err, req, res, next) => {
    let data = {
        message: err.message || "an error happened"
    };

    if ((config.isDevelopment || config.isTest) && err.stack) {
        // add stack in development env
        data.stack = err.stack.split("\n").map(i => i.trim());
    }

    if (config.isDevelopment) {
        console.log(err);
    }

    if (!res.headersSent) {
        if (!res.statusCode || res.statusCode === 200) {
            res.status(500);
        }

        res.json(data);
    }
});

// create server
if (!config.isTest) {
    app.listen(process.env.PORT, process.env.HOST || "127.0.0.1", () => {
        console.log(`> app is running to port ${process.env.PORT}`);
    });
}

module.exports = app;
