const router = require("express").Router();
const { validate, body } = require("@middleware/validate");
const Admin = require("@models/admin");
const bcryptjs = require("bcryptjs");

const validations = [
    body("username")
        .trim()
        .exists({ checkFalsy: true }),
    body("password")
        .trim()
        .exists({ checkFalsy: true })
];

router.post("/login", validate(validations), async (req, res, next) => {
    try {
        let admin = await Admin.findOne({
            $or: [{ username: req.body.username }, { email: req.body.username }]
        });

        if (
            !admin ||
            !bcryptjs.compareSync(req.body.password, admin.password)
        ) {
            return res
                .status(400)
                .json({ message: "username or password is wrong" });
        }

        res.json(await admin.toAuthJson(req));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
