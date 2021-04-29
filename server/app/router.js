const router = require("express").Router();
var path = require("path");

/**
 * login form
 */
router.use("/login", function (req, res) {
  res.sendFile(path.join(__dirname + "/login.html"));
});

//router.use('/db', require('./db.js').router);

router.use("/", require("./captcha.js"));

router.use("/api/a_*", require("./authCheck.js")); //private
//router.use('functions/api/', require('./limiterCheck.js')); //public + private
router.use("/api", require("./api.js").router);

router.use("/auth", require("./auth.js"));

router.use("/", (req, res) => {
  if (req.session.apiKey) {
    res.send("Welcome back, " + req.session.apiKey + "!");
  } else {
    res.send("Please login to view this page!");
  }
  res.end();
});

module.exports = router;
