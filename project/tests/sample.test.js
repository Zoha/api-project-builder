const { expect } = require("chai");
const request = require("supertest");
const app = require("../server");

describe("sample tests", () => {
    it("is ok", () => {
        expect(true).to.be.equal(true);
    });

    it("returns json for index", done => {
        request(app)
            .get("/")
            .expect("Content-Type", /json/)
            .expect(200)
            .end(err => {
                if (err) throw err;
                done();
            });
    });
});
