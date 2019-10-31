const request = require("supertest");
const config = require("../../config");
const { expect } = require("chai");
require("../../src/moduleAliasInit");
const express = require("express");
const app = express();
const { required } = require("@middleware/auth");
const role = require("@middleware/role");
const jwt = require("jsonwebtoken");

app.get("/required", required, role("admin"), (req, res) => {
    res.json({
        ok: true,
        user: req.user
    });
});

describe("role middleware", () => {
    it("will will return 400 error if user was not permitted", async () => {
        const token = jwt.sign(
            {
                isUser: true,
                role: "user"
            },
            process.env.SECRET
        );
        await request(app)
            .get("/required?authToken=" + token)
            .expect(400)
            .expect("Content-Type", /json/);
    });

    it("will will return 200 if user was not permitted", async () => {
        const token = jwt.sign(
            {
                isUser: true,
                role: "admin"
            },
            process.env.SECRET
        );
        await request(app)
            .get("/required?authToken=" + token)
            .expect(200)
            .expect("Content-Type", /json/);
    });
});
