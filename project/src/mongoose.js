const mongoose = require("mongoose");
const config = require("../config");

mongoose.Promise = global.Promise;
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

const connectionUri = config.isTest
    ? process.env.MONGODB_URI_TEST
    : process.env.MONGODB_URI;

mongoose.connect(connectionUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = mongoose;
