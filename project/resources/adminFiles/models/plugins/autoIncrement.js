const { autoIncrement } = require("mongoose-plugin-autoinc");

module.exports = (schema, { model }) => {
    schema.plugin(autoIncrement, {
        field: "id",
        model: model,
        startAt: 1
    });

    schema.methods.find;
};
