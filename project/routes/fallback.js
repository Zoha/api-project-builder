const router = require("express").Router();

// 404 not found error handler ( fallback )
router.use((req, res, next) => {
    res.status(404);
    return next(new Error("request address not found"));
});

module.exports = router;
