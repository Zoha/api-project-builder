const app = require("../../server");
const request = require("supertest");
const { expect } = require("chai");
const Admin = require("@models/admin");
const adminSeeder = require("@seeders/admin");
const moment = require("moment");

describe("admins auth json functionality", () => {
    beforeEach(async () => {
        await Admin.deleteMany();
        await Admin.resetCount();
    });

    it("will create auth json just once", async () => {
        let result = await adminSeeder({
            username: "zoha",
            email: "zoha.banam@gmail.com",
            name: "some name"
        });

        await request(app)
            .post("/admins/login")
            .send({
                username: result.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                result = resObject;
            });

        await request(app)
            .post("/admins/login")
            .send({
                username: result.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                expect(resObject.token).to.be.equals(result.token);
            });
    });

    it("will regenerate auth json if admin was updated", async () => {
        let result = await adminSeeder({
            username: "zoha",
            email: "zoha.banam@gmail.com",
            name: "some name"
        });

        await request(app)
            .post("/admins/login")
            .send({
                username: result.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                result = resObject;
            });

        await new Promise((resolve, reject) => {
            setTimeout(async () => {
                let createdAdmin = await Admin.findOne({ username: "zoha" });
                await createdAdmin.updateOne({
                    email: "zoha.banam2@gmail.com"
                });
                resolve();
            }, 1000);
        });

        await request(app)
            .post("/admins/login")
            .send({
                username: result.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                expect(resObject.token).to.be.not.equals(result.token);
            });
    });

    it("will regenerate auth json if token from db was invalid", async () => {
        let result = await adminSeeder({
            username: "zoha",
            email: "zoha.banam@gmail.com",
            name: "some name"
        });

        await request(app)
            .post("/admins/login")
            .send({
                username: result.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                result = resObject;
            });

        let createdAdmin = await Admin.findOne({ username: "zoha" });
        await createdAdmin.updateOne({
            "tokens.auth": "notValidToken",
            lastLogin: moment()
        });

        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        });

        await request(app)
            .post("/admins/login")
            .send({
                username: result.username,
                password: "secret"
            })
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                let resObject = JSON.parse(res.text);
                expect(resObject.token)
                    .to.be.not.equals(result.token)
                    .and.to.be.not.equals("notValidToken");
            });
    });
});
