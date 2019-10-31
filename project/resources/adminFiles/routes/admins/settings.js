const router = require("express").Router();
const { required } = require("@middleware/admin");
const Admin = require("@models/admin");
const bcrypt = require("bcryptjs");

router.post("/settings", required, async (req, res, next) => {
    try {
        let admin = await Admin.findOne({
            _id: req.user._id
        });
        if (!admin) {
            return next();
        }

        delete req.body.createdAt;
        delete req.body.updatedAt;
        delete req.body.isDeleted;
        delete req.body.isUpdated;
        delete req.body.id;
        delete req.body._id;
        delete req.body.role;

        if (req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password);
        }

        await admin.updateOne({
            ...req.body
        });

        admin = await Admin.findOne({
            _id: req.user._id
        });

        let adminObject = admin.toObject();

        delete adminObject.password;
        delete adminObject.tokens;

        res.json(adminObject);
    } catch (e) {
        next(e);
    }
});

module.exports = router;
