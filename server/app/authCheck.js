const db = require("./db.js");
const router = require("express").Router();

const { ADMINS, USERS } = require("./common.js");

router.post("/*", async function (req, res, next) {
  const apiKey = req.session.apiKey;

  let results = await db.simpleGetHandler(USERS, { body: { apiKey } });

  if (results && results.length > 0) {
    next();
  } else {
    results = await db.simpleGetHandler(ADMINS, { body: { apiKey } });

    if (results && results.length > 0) {
      next();
      return;
    }

    res.status(401).send("Unauthenticated");
  }
});

module.exports = router;
