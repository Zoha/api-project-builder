const request = require("supertest");
const config = require("../../config");
const { expect } = require("chai");
require("../../src/moduleAliasInit");
const express = require("express");
const app = express();
const { optional, required } = require("@middleware/auth");
const jwt = require("jsonwebtoken");

app.get("/optional", optional, (req, res) => {
    res.json({
        ok: true,
        admin: req.user
    });
});

app.get("/required", required, (req, res) => {
    res.json({
        ok: true,
        admin: req.user
    });
});

describe("auth middleware", () => {
    it("will not return auth error if auth is optional", async () => {
        await request(app)
            .get("/optional")
            .expect(200)
            .expect("Content-Type", /json/);
    });

    it("will have user if was sent for optional auth", async () => {
        const token = jwt.sign(
            {
                isAdmin: true
            },
            process.env.SECRET
        );
        await request(app)
            .get("/optional?authToken=" + token)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.haveOwnProperty("admin");
                expect(response.admin)
                    .to.haveOwnProperty("isAdmin")
                    .that.equals(true);
            });
    });

    it("will return unauthorized error if token not exists in required auth", async () => {
        await request(app)
            .get("/required")
            .expect(401);
    });

    it("will have admin in response for required auth ", async () => {
        const token = jwt.sign(
            {
                isAdmin: true
            },
            process.env.SECRET
        );
        await request(app)
            .get("/optional?authToken=" + token)
            .expect(200)
            .expect("Content-Type", /json/)
            .expect(res => {
                const response = JSON.parse(res.text);
                expect(response).to.haveOwnProperty("admin");
                expect(response.admin)
                    .to.haveOwnProperty("isAdmin")
                    .that.equals(true);
            });
    });

    it("will return unauthorized for invalid token", async () => {
        const token = jwt.sign(
            {
                isAdmin: true
            },
            process.env.SECRET + "sdf"
        );
        await request(app)
            .get("/optional?authToken=" + token)
            .expect(401);
        await request(app)
            .get("/required?authToken=" + token)
            .expect(401);
    });
});
