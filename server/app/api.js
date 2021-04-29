var express = require("express");
const router = express.Router();
const db = require("./db.js");
let Queue = require("bull");

var apiFunctions = require("./api/index.js");
var iotaH = require("./iotaWrapper.js");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const INTERNAL = "internal";
const PUBLIC = "public";
const PRIVATE = "private";

router.post(`/:function/:id?`, async function (req, res) {
  let fun = req.params.function;

  let apiType;

  if (fun.substring(0, 2) === "a_") {
    apiType = PRIVATE;
  } else {
    apiType = PUBLIC;
  }

  if (api[apiType][fun] != null) {
    const result = await api[apiType][fun](req);

    /* an authenticated or public api call has these return types */

    if (!result) {
      //null (usually wrong input parameters)

      res.status(400).send("400 - Bad request");
      res.end();
      return;
    }

    if (result && result.hasOwnProperty("affectedRows")) {
      //array

      if (result.affectedRows > 0) {
        res.status(200).send(true);
      } else {
        res.status(200).send(false);
      }
    } 
    else if (result && result.hasOwnProperty("error")) {
      //result obj containing {error}

      res.status(200).send(result);
    } else {
      //result obj/string

      res.send(result);
    }
  } else {
    //enpoint does not exist

    res.status(404).send("Not found");
  }
});

function BindToClass(functionsObject, thisClass) {
  for (let [apiType, fn] of Object.entries(functionsObject)) {
    for (let [functionKey, functionValue] of Object.entries(fn)) {
      thisClass[apiType][functionKey] = functionValue.bind(thisClass);
    }
  }
}

/* API **/

class Api {
  constructor() {
    this.db = db;
    this.iotaH = iotaH;
    this.workQueue = new Queue("work", REDIS_URL);

    this[PUBLIC] = {};
    this[PRIVATE] = {};
    this[INTERNAL] = {};

    this[PUBLIC].getFreeAddress = async (req) =>
      await iotaH.iotaGetFreeAddress(req);
    this[PUBLIC].isValidAddress = async (req) =>
      await iotaH.iotaIsValidAddress(req);

    for (let [, functionValue] of Object.entries(apiFunctions)) {
      BindToClass(functionValue, this);
    }
  }
}

var api = new Api();

//check limiters
//redefine limits
//delete black list

module.exports = { router, api };
