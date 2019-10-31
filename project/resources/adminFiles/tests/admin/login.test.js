const app = require("../../server");
const request = require("supertest");
const { expect } = require("chai");
const Admin = require("@models/admin");
const adminSeeder = require("@seeders/admin");

describe("login functionality", () => {
    beforeEach(async () => {
        await Admin.deleteMany();
        await Admin.resetCount();
    });

    it("return bad request by default request", async () => {
        await request(app)
            .post("/admins/login")
            .expect("Content-Type", /json/)
            .expect(400);
    });

    it("will return valid auth json with valid credentials", async () => {
        let admin = await adminSeeder();
        let result;
        await request(app)
            .post("/admins/login")
            .send({
                username: admin.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                result = resObject;
            });

        admin = await Admin.findOne({ username: admin.username });
        expect(admin).to.be.instanceOf(Admin);
        expect(admin.username).to.be.equal(result.username);
        expect(admin.email).to.be.equal(result.email);
        expect(admin.name).to.be.equal(result.name);
        expect(result.token)
            .to.be.a("string")
            .and.to.be.equals(admin.tokens.auth);
    });

    it("can login with email", async () => {
        let admin = await adminSeeder();
        await request(app)
            .post("/admins/login")
            .send({
                username: admin.email,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/);
    });
});
