const { expect } = require("chai");
require("../../server");
const seeder = require("@seeders/admin");
const admin = require("@models/admin");

describe("admin seeder", () => {
    beforeEach(async () => {
        await admin.deleteMany();
        await admin.resetCount();
    });

    it("create a admin with admin seeder", async () => {
        let created = await seeder();

        expect(created).to.be.instanceOf(admin);
    });

    it("create multiple admin with admin seeder and return as array", async () => {
        let createdInstances = await seeder(5);

        expect(createdInstances)
            .to.be.an("array")
            .and.lengthOf(5);

        expect(createdInstances[0]).to.be.instanceOf(admin);
    });

    it("create a admin with given data with admin seeder", async () => {
        let created = await seeder({
            username: "zoha",
            name: "zoha"
        });

        expect(created).to.be.instanceOf(admin);
        expect(created.username).to.be.equals("zoha");
        expect(created.name).to.be.equals("zoha");
    });
});
