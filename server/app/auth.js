const utils = require("./utils.js");
const db = require("./db.js");
const router = require("express").Router();

const { ADMINS, ADMINSDATA, USERS, USERSDATA } = require("./common.js");

function evalPassword(passw) {
  const pepper = process.env.pepper;
  return utils.getSHA256ofJSON(passw + pepper + passw);
}

const auth = async (req, res, table) => {
  const datatable = table + "data";
  if (![USERSDATA, ADMINSDATA].includes(datatable)) {
    res.send({ error: "Internal error" });
    res.end();
    return;
  }

  var username_hash = utils.getSHA256ofJSON(req.body.username);
  var passw = evalPassword(req.body.passw);
  let passw_recovery_used = false;

  let results;

  if (username_hash && passw) {
    results = await db.simpleGetHandler(datatable, {
      body: { username_hash, passw },
    });

    if (!results || results.length === 0) {
      results = await db.simpleGetHandler(datatable, {
        body: { username_hash, passw_recovery: passw },
      });

      if (results && results.length === 1) {
        if (
          !results.passw_recovery_date ||
          !utils.expired(results.passw_recovery_date)
        ) {
          passw_recovery_used = true;
        } else {
          res.send({ error: "Recovery password expired" });
          res.end();
          return;
        }
      }
    }

    if (results && results.length === 1) {
      const result = results[0];

      let user = await db.simpleGetHandler(table, {
        body: { id: result.users_id },
      });

      if (!user || user.length === 0 || user[0].deleted !== null) {
        res.send({ error: "Incorrect username or password!" });
        res.end();
        return;
      }

      const apiKey = utils.getSHA256ofJSON(utils.uuidv4());
      const apiKeyCreation = {
        toSqlString: function () {
          return "NOW()";
        },
      };
      const permissionRequired = false; // we already authenticated via user/passw so we can write new apiKey
      const results2 = await db.postHandler(
        table,
        { params: { id: result.users_id }, body: { apiKey, apiKeyCreation } },
        permissionRequired
      );

      if (results2 && results2.affectedRows > 0) {
        req.session.apiKey = apiKey;
        req.session.apiKeyCreation = Date.now();

        res.send({ users_id: result.users_id, passw_recovery_used });
      }
    } else {
      res.send({ error: "Incorrect username or password!" });
    }
    res.end();
  } else {
    res.send({ error: "Please enter username and password!" });
    res.end();
  }
};

/**
 * user authentification
 * @param      {default}  body  passw (encoded sha, not real string), username //
 * @returns    {default} error or redirect to /
 */
router.post("/", async function (req, res) {
  auth(req, res, USERS);
});

router.post("/admin", async function (req, res) {
  auth(req, res, ADMINS);
});

router.post("/logout", async function (req, res) {
  const apiKey = req.session.apiKey;
  req.session.destroy();
  const results = await db.simpleGetHandler(USERS, { body: { apiKey } });
  if (results.length === 1) {
    const result = results[0];
    const permissionRequired = false; // we already authenticated via apiKey so we can write new apiKey
    db.postHandler(
      USERS,
      {
        params: { id: result.id },
        body: { apiKey: null, apiKeyCreation: null },
      },
      permissionRequired
    );
  }
  res.redirect("/");
});

module.exports = router;
