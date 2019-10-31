const app = require("../../server");
const request = require("supertest");
const { expect } = require("chai");
const Admin = require("@models/admin");
const adminSeeder = require("@seeders/admin");
const bcrypt = require("bcryptjs");

describe("admins routes", async () => {
    beforeEach(async () => {
        await Admin.deleteMany();
    });

    it("will return expected json for index route", async () => {
        const admin = await adminSeeder({ role: "superAdmin" });
        await request(app)
            .get(`/admins`)
            .expect(401)
            .expect("Content-Type", /json/);

        await request(app)
            .get(`/admins`)
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
                expect(response[0]).to.haveOwnProperty("name");
                expect(response[0]).to.haveOwnProperty("username");
                expect(response[0]).to.haveOwnProperty("email");
                expect(response[0]).to.haveOwnProperty("id");
                expect(response[0]).to.haveOwnProperty("role");
                expect(response[0]).to.haveOwnProperty("lastLogin");
            });
    });

    it("will return expected json for single route", async () => {
        const admin = await adminSeeder({ role: "superAdmin" });

        await request(app)
            .get(`/admins/${admin.username}`)
            .send({
                authToken: admin.tokens.auth
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.be.an("object");
                expect(response).to.haveOwnProperty("name");
                expect(response).to.haveOwnProperty("username");
                expect(response).to.haveOwnProperty("email");
                expect(response).to.haveOwnProperty("id");
                expect(response).to.haveOwnProperty("role");
                expect(response).to.haveOwnProperty("lastLogin");
            });
    });

    it("will return expected json for create route", async () => {
        const admin = await adminSeeder({ role: "superAdmin" });

        await request(app)
            .post(`/admins`)
            .send({
                authToken: admin.tokens.auth,
                name: "name",
                username: "username",
                email: "email@gmail.com",
                password: "secret",
                bio: "something"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.be.an("object");
                expect(response).to.haveOwnProperty("name");
                expect(response).to.haveOwnProperty("username");
                expect(response).to.haveOwnProperty("email");
                expect(response).to.haveOwnProperty("id");
                expect(response).to.haveOwnProperty("role");
                expect(response).to.haveOwnProperty("lastLogin");
            });
        const admins = await Admin.find({});
        expect(admins).to.have.lengthOf(2);
        expect(admins[1].name).to.be.equal("name");
        expect(admins[1].username).to.be.equal("username");
        expect(admins[1].email).to.be.equal("email@gmail.com");
        expect(admins[1].lastLogin).to.be.a("date");
        expect(admins[1].role).to.be.a("string");
        expect(admins[1].password).to.not.be.equal("secret");
        expect(bcrypt.compareSync("secret", admins[1].password)).to.be.equal(
            true
        );
    });

    it("will return expected json for update route", async () => {
        const admin = await adminSeeder({ role: "superAdmin" });

        await request(app)
            .put(`/admins/${admin.id}`)
            .send({
                authToken: admin.tokens.auth,
                name: "name",
                username: "username",
                email: "email@gmail.com",
                password: "secret",
                role: "admin"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.be.an("object");
                expect(response).to.haveOwnProperty("name");
                expect(response).to.haveOwnProperty("username");
                expect(response).to.haveOwnProperty("email");
                expect(response).to.haveOwnProperty("id");
                expect(response).to.haveOwnProperty("role");
                expect(response).to.haveOwnProperty("lastLogin");
            });
        const admins = await Admin.find({});
        expect(admins).to.have.lengthOf(1);
        expect(admins[0].name).to.be.equal("name");
        expect(admins[0].username).to.be.equal("username");
        expect(admins[0].email).to.be.equal("email@gmail.com");
        expect(admins[0].lastLogin).to.be.a("date");
        expect(admins[0].role).to.be.a("string");
        expect(admins[0].password).to.not.be.equal("secret");
        expect(bcrypt.compareSync("secret", admins[0].password)).to.be.equal(
            true
        );
    });

    it("will return expected json for delete route", async () => {
        const admin = await adminSeeder({ role: "superAdmin" });

        await request(app)
            .delete(`/admins/${admin.id}`)
            .send({
                authToken: admin.tokens.auth
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.be.an("object");
                expect(response).to.haveOwnProperty("name");
                expect(response).to.haveOwnProperty("username");
                expect(response).to.haveOwnProperty("email");
                expect(response).to.haveOwnProperty("id");
                expect(response).to.haveOwnProperty("role");
                expect(response).to.haveOwnProperty("lastLogin");
            });
        const admins = await Admin.find({});
        expect(admins).to.have.lengthOf(0);
    });

    it("will update current admin by setting route", async () => {
        const admin = await adminSeeder({ role: "superAdmin" });

        await request(app)
            .post(`/admins/settings`)
            .send({
                name: "name",
                username: "username",
                email: "email@gmail.com",
                password: "secret",
                role: "admin"
            })
            .expect(401);

        await request(app)
            .post(`/admins/settings`)
            .send({
                authToken: admin.tokens.auth,
                name: "name",
                username: "username",
                email: "email@gmail.com",
                password: "secret",
                role: "admin"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.be.an("object");
                expect(response).to.haveOwnProperty("name");
                expect(response).to.haveOwnProperty("username");
                expect(response).to.haveOwnProperty("email");
                expect(response).to.haveOwnProperty("id");
                expect(response).to.haveOwnProperty("role");
                expect(response).to.haveOwnProperty("lastLogin");
                expect(response).to.not.haveOwnProperty("password");
                expect(response).to.not.haveOwnProperty("token");
                expect(response).to.not.haveOwnProperty("tokens");
            });

        const admins = await Admin.find({});
        expect(admins).to.have.lengthOf(1);
        expect(admins[0].name).to.be.equal("name");
        expect(admins[0].username).to.be.equal("username");
        expect(admins[0].email).to.be.equal("email@gmail.com");
        expect(admins[0].lastLogin).to.be.a("date");
        expect(admins[0].role).to.be.a("string");
        expect(admins[0].password).to.not.be.equal("secret");
        expect(bcrypt.compareSync("secret", admins[0].password)).to.be.equal(
            true
        );
    });
});
