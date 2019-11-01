const fs = require("fs");
const path = require("path");
const pluralize = require("pluralize");
const { red } = require("chalk");

const createRouteFile = async (
    schemaPath,
    routeIndexFile,
    modelFileName,
    modelName
) => {
    let directory = path.dirname(routeIndexFile);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
    return new Promise((resolve, reject) => {
        fs.readFile(schemaPath, "utf8", (err, content) => {
            if (err) return reject(err);
            let exportsText = `const ${modelName} = require("@models/${modelFileName}");\n`;
            exportsText += `const resource = require("rest-schema");\n`;
            exportsText += `const router = require("express").Router();\n`;
            let newContent =
                exportsText +
                content.replace(
                    /module\.exports\s?\=\s?\{/,
                    `router.use(resource({\n\tmodel : ${modelName},`
                );
            newContent = newContent.replace(/\n\};/, "\n}));");

            newContent += "\n\nmodule.exports = router";
            fs.writeFile(routeIndexFile, newContent, "utf8", err => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

const createTestFiles = async (name, modelName) => {
    let testContent = "";
    let testFilePath = path.join(
        __dirname,
        `../tests/routes/${pluralize(name)}.test.js`
    );

    if (fs.existsSync(testFilePath)) {
        console.log("test file already exists");
        return;
    }

    let schema = require("../resources/schema/" + name);

    // imports
    testContent += `const app = require("../../server");\nconst request = require("supertest");\nconst { expect } = require("chai");\n`;
    testContent += `const ${modelName} = require("@models/${name}")\n`;
    testContent += `const ${name}Seeder = require("@seeders/${name}")\n`;
    testContent += `const Admin = require("@models/admin")\n`;
    testContent += `const adminSeeder = require("@seeders/admin")\n`;
    testContent += `const fs = require("fs");\n`;
    testContent += `const path = require("path");\n`;
    testContent += `const faker = require("faker");\n`;
    // require all models for delete them in before each function
    testContent += `\n
let models = [];
files = fs.readdirSync(path.join(__dirname, "../../models"));
for (let file of files.filter(i => /\.js$/.test(i))) {
    models.push(require("@models/" + file));
}
    `;

    // create before each function
    testContent += `\n
describe("${pluralize(name)} routes", async () => {
    beforeEach(async () => {
        for(let model of models){
            await model.deleteMany();
            await model.resetCount();
        }
    });
    `;

    // index route
    if (schema.routes.includes("index")) {
        testContent += `\n
        it("index route of ${pluralize(name)}", async () => {
            const ${name} = await ${name}Seeder();
            const admin = await adminSeeder();

            await request(app)
                .get(\`/${pluralize(name)}\`)
                .send({
                    authToken: admin.tokens.auth
                })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect(res => {
                    const response = JSON.parse(res.text);
                    expect(response)
                        .to.be.an("array")
                        .and.have.lengthOf(1);
                    ${Object.keys(schema.fields)
                        .filter(k => !schema.fields[k].hide)
                        .map(
                            k =>
                                `expect(response[0]).to.haveOwnProperty("${k}")`
                        )
                        .join("\n\t\t\t\t\t")}
                });
        });
        `;
    }

    // single route
    if (schema.routes.includes("single")) {
        testContent += `\n
        it("single route of ${pluralize(name)}", async () => {
            const ${name} = await ${name}Seeder();
            const admin = await adminSeeder();

            await request(app)
                .get(\`/${pluralize(name)}/\$\{${name}.${
            schema.routeKeys[0]
        }\}\`)
                .send({
                    authToken: admin.tokens.auth
                })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect(res => {
                    const response = JSON.parse(res.text);
                    expect(response).to.be.an("object");
                    ${Object.keys(schema.fields)
                        .filter(k => !schema.fields[k].hide)
                        .map(k => `expect(response).to.haveOwnProperty("${k}")`)
                        .join("\n\t\t\t\t\t")}
                });
        });
        `;
    }

    // create route
    if (schema.routes.includes("create")) {
        testContent += `\n
        it("create route of ${pluralize(name)}", async () => {
            const admin = await adminSeeder();

            await request(app)
                .post(\`/${pluralize(name)}\`)
                .send({
                    authToken: admin.tokens.auth,
                    ${Object.keys(schema.fields)
                        .filter(
                            k =>
                                !schema.fields[k].hide &&
                                schema.fields[k].type === String
                        )
                        .map(k => `${k} : faker.lorem.word()`)
                        .join("\n\t\t\t\t\t")}
                })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect(res => {
                    const response = JSON.parse(res.text);
                    expect(response).to.be.an("object");
                    ${Object.keys(schema.fields)
                        .filter(
                            k =>
                                !schema.fields[k].hide &&
                                schema.fields[k].type === String
                        )
                        .map(k => `expect(response).to.haveOwnProperty("${k}")`)
                        .join("\n\t\t\t\t\t")}
                });
            const ${pluralize(name)} = await ${modelName}.find({});
            expect(${pluralize(name)}).to.have.lengthOf(1);
        });
        `;
    }

    // create route
    if (schema.routes.includes("update")) {
        testContent += `\n
        it("update route of ${pluralize(name)}", async () => {
            const admin = await adminSeeder();
            const ${name} = await ${name}Seeder();

            await request(app)
                .put(\`/${pluralize(name)}/\$\{${name}.${
            schema.routeKeys[0]
        }\}\`)
                .send({
                    authToken: admin.tokens.auth,
                    ${Object.keys(schema.fields)
                        .filter(
                            k =>
                                !schema.fields[k].hide &&
                                schema.fields[k].type === String
                        )
                        .map(k => `${k} : faker.lorem.word()`)
                        .join("\n\t\t\t\t\t")}
                })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect(res => {
                    const response = JSON.parse(res.text);
                    expect(response).to.be.an("object");
                    ${Object.keys(schema.fields)
                        .filter(
                            k =>
                                !schema.fields[k].hide &&
                                schema.fields[k].type === String
                        )
                        .map(k => `expect(response).to.haveOwnProperty("${k}")`)
                        .join("\n\t\t\t\t\t")}
                });
            const ${pluralize(name)} = await ${modelName}.find({});
            expect(${pluralize(name)}).to.have.lengthOf(1);
            ${Object.keys(schema.fields)
                .filter(
                    k =>
                        !schema.fields[k].hide &&
                        schema.fields[k].type === String
                )
                .map(
                    k =>
                        `expect(${pluralize(
                            name
                        )}[0].toObject()).to.haveOwnProperty("${k}").that.not.equals(${name}.${k})`
                )
                .join("\n\t\t\t")}
            });
        `;
    }

    // create route
    if (schema.routes.includes("delete")) {
        testContent += `\n
        it("delete route of ${pluralize(name)}", async () => {
            const admin = await adminSeeder();
            const ${name} = await ${name}Seeder();

            await request(app)
                .delete(\`/${pluralize(name)}/\$\{${name}.${
            schema.routeKeys[0]
        }\}\`)
                .send({
                    authToken: admin.tokens.auth
                })
                .expect(200)
                .expect("Content-Type", /json/)
                .expect(res => {
                    const response = JSON.parse(res.text);
                    expect(response).to.be.an("object");
                    ${Object.keys(schema.fields)
                        .filter(k => !schema.fields[k].hide)
                        .map(k => `expect(response).to.haveOwnProperty("${k}")`)
                        .join("\n\t\t\t\t\t")}
                });
            const ${pluralize(name)} = await ${modelName}.find({});
            expect(${pluralize(name)}).to.have.lengthOf(0);
        });
        `;
    }

    testContent += `\n
});
    `;

    await new Promise((resolve, reject) => {
        fs.writeFile(testFilePath, testContent, "utf8", err => {
            if (err) return reject(err);
            console.log("test file created successfully");
            resolve();
        });
    });
};

const addRouteToIndexRouteFile = async name => {
    const indexRoutePath = path.join(__dirname, "../routes/index.js");
    return new Promise((resolve, reject) => {
        fs.readFile(indexRoutePath, "utf8", (err, content) => {
            if (err) return reject(err);
            let newContent = content.replace(
                "// fallback",
                `// ${name} routes\nrouter.use("/${pluralize(
                    name
                )}",require("./${pluralize(name)}"));\n// fallback`
            );
            fs.writeFile(indexRoutePath, newContent, "utf8", err => {
                if (err) return reject(err);
                resolve();
                console.log("route file updated");
            });
        });
    });
};

module.exports = async name => {
    const schemaPath = path.join(
        __dirname,
        "../resources/schema/" + pluralize.singular(name) + ".js"
    );
    const routeIndexFile = path.join(
        __dirname,
        "../routes/" + pluralize(pluralize.singular(name)) + "/index.js"
    );

    if (!fs.existsSync(schemaPath)) {
        return console.log(red("schema file not exists"));
    }

    if (fs.existsSync(routeIndexFile)) {
        return console.log(
            red("route file already exists. use update:resource command")
        );
    }

    await createTestFiles(
        pluralize.singular(name),
        pluralize
            .singular(name)
            .charAt(0)
            .toUpperCase() + pluralize.singular(name).slice(1)
    );

    await createRouteFile(
        schemaPath,
        routeIndexFile,
        pluralize.singular(name),
        pluralize
            .singular(name)
            .charAt(0)
            .toUpperCase() + pluralize.singular(name).slice(1)
    );

    await addRouteToIndexRouteFile(pluralize.singular(name));

    console.log("route field created successfully");

    process.exit();
};
