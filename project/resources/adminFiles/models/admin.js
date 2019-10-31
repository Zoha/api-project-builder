const mongoose = require("@src/mongoose");
const autoIncrement = require("./plugins/autoIncrement");
const paginatePlugin = require("mongoose-paginate-v2");

const AdminSchema = require("./admin/schema");

// auto increment plugin
AdminSchema.plugin(autoIncrement, { model: "Admin" });
AdminSchema.plugin(paginatePlugin);

AdminSchema.methods.toAuthJson = require("./admin/toAuthJson");

module.exports = mongoose.model("Admin", AdminSchema);
