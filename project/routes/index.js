const router = require("express").Router();

router.get("/", (req, res, next) => {
    res.json({
        message: "app is running"
    });
});

// fallback
router.use(require("./fallback"));

module.exports = router;
