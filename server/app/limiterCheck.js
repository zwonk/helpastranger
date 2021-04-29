const DB = require("./db.js");
const router = require("express").Router();
//var blacklist = require('express-blacklist');

const { USERS_DATA } = require("./common.js");

//NOTE currently not used

var db = new DB();

const USERS = "users";
const LOGS = "logs";

const PUBLIC_WRITE_APIS = ["createQrCodes", "createAffected", "createUsers"];

const PRIVATE_WRITE_CRITICAL_APIS = [
  "createRecurrent",
  "createQrCodes",
  "createCashouts",
  "createWithdraws",
  "createLocations",
  "createEdits",
];

const PUBLIC_REQ_LIMIT = 100000;
const PUBLIC_CREATE_LIMIT = 10000;
const SINGLE_IP_CREATE_LIMIT = 50;
const SINGLE_IP_REQ_LIMIT = 500;
const SINGLE_USER_CREATE_LIMIT = 50;
const SINGLE_USER_REQ_LIMIT = 500;

const ID = "users_id";
const IP = "ip";

function block(id, type) {
  const users_id = id;

  if (type === ID) {
    const permissionRequired = false;
    const apiAsId = false;
    const postViaUserId = true;

    db.postHandler(
      USERS_DATA,
      {
        params: { id: users_id },
        body: {
          flagged: {
            toSqlString: function () {
              return "NOW()";
            },
          },
        },
      },
      permissionRequired,
      apiAsId,
      postViaUserId
    );
  } else if (type === IP) {
    //blacklist.addAddress(ipAddress);
  }
}

router.post("/:function", async function (req, res, next) {
  const apiKey = req.session.apiKey;
  const permissionRequired = false;

  if (apiKey) {
    const writeLog =
      PRIVATE_WRITE_CRITICAL_APIS.indexOf(req.params.function) === true ? 1 : 0;
    const results = await db.simpleGetHandler(USERS, { body: { apiKey } });
    if (results && results.length === 1) {
      if (writeLog) {
        db.putHandler(
          LOGS,
          {
            params: {},
            body: { users_id: results[0].id, ip: req.ip, write_op: 1 },
          },
          permissionRequired
        );
      } else {
        db.putHandler(
          LOGS,
          { params: {}, body: { users_id: results[0].id, ip: req.ip } },
          permissionRequired
        );
      }
    }
  } else {
    const writeLog = PUBLIC_WRITE_APIS.indexOf(req.params.function);
    const readLog = Math.floor(Math.random() * 100) < 1; //write 1% of reads
    if (writeLog) {
      db.putHandler(
        LOGS,
        { params: {}, body: { ip: req.ip, write_op: 1 } },
        permissionRequired
      );
    } else if (readLog) {
      db.putHandler(
        LOGS,
        { params: {}, body: { ip: req.ip } },
        permissionRequired
      );
    }
  }

  const randN = Math.floor(Math.random() * 1000);
  const checkAuth = randN < 10; //check 1 in 100
  const checkPublic = randN < 1; //check 1 in 1000

  if (checkAuth) {
    const queryTotals =
      "SELECT COUNT(id) as count, users_id FROM logs WHERE created_at > CURDATE() - INTERVAL 1 DAY GROUP BY users_id;";
    const reqcountTotals = await db.customSQL(queryTotals, [], [], false);
    const queryWrites =
      "SELECT COUNT(id) as count, users_id FROM logs WHERE created_at > CURDATE() - INTERVAL 1 DAY AND write_op = 1 GROUP BY users_id;";
    const reqcountWrites = await db.customSQL(queryWrites, [], [], false);
    reqcountTotals.forEach((calls) =>
      calls.count > SINGLE_USER_REQ_LIMIT ? block(calls.users_id, ID) : void 0
    );
    reqcountWrites.forEach((calls) =>
      calls.count > SINGLE_USER_CREATE_LIMIT
        ? block(calls.users_id, ID)
        : void 0
    );
  }

  if (checkPublic) {
    const queryTotals =
      "SELECT COUNT(id) as count, ip FROM logs WHERE created_at > CURDATE() - INTERVAL 1 DAY GROUP BY ip;";
    const reqcountTotals = await db.customSQL(queryTotals, [], [], false);
    const queryWrites =
      "SELECT COUNT(id) as count, ip FROM logs WHERE created_at > CURDATE() - INTERVAL 1 DAY AND write_op = 1 GROUP BY ip;";
    const reqcountWrites = await db.customSQL(queryWrites, [], [], false);

    reqcountTotals.forEach((calls) =>
      calls.count > SINGLE_IP_REQ_LIMIT ? block(calls.ip, IP) : void 0
    );
    reqcountWrites.forEach((calls) =>
      calls.count > SINGLE_IP_CREATE_LIMIT ? block(calls.ip, IP) : void 0
    );

    const totalRequests = reqcountTotals.reduce(
      (sum, calls) => sum + calls.count
    );
    const totalWrites = reqcountWrites.reduce(
      (sum, calls) => sum + calls.count
    );

    if (totalRequests > PUBLIC_REQ_LIMIT) {
      //TODO BLOCK further requests;
    }
    if (totalWrites > PUBLIC_CREATE_LIMIT) {
      //TODO BLOCK further requests;
    }
  }

  next();
});

module.exports = router;
