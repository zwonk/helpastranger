// Only run this in development
if (process.env.NODE_ENV !== "production") {
  const chokidar = require("chokidar");

  // Set up watcher to watch all files in ./server/app
  const watcher = chokidar.watch("./app");

  watcher.on("ready", function () {
    // On any file change event
    // You could customise this to only run on new/save/delete etc
    // This will also pass the file modified into the callback
    // however for this example we aren't using that information
    watcher.on("all", function () {
      console.log("Reloading server...");
      // Loop through the cached modules
      // The "id" is the FULL path to the cached module
      Object.keys(require.cache).forEach(function (id) {
        // Get the local path to the module
        const localId = id.substr(process.cwd().length);

        // Ignore anything not in server/app
        if (!localId.match(/^\/app\//)) return;

        // Remove the module from the cache
        delete require.cache[id];
      });
      console.log("Server reloaded.");
    });
  });
}

if (process.env.NODE_ENV === "test") {
  //console.log = () => {}
}

if (parseInt(process.env.CONSOLE_OFF) === 1) {
    console.log = function () { };
}


const express = require("express");
var cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });

/*var expressDefend = require('express-defend');
var blacklist = require('express-blacklist');*/

var session = require("express-session");
var MemoryStore = require("memorystore")(session);

const port = parseInt(process.env.PORT, 10) || 5000;

const app = express();

const origin =
  process.env.NODE_ENV === "production"
    ? process.env.DEV === "true"
      ? process.env.IP_DEV
      : process.env.IP_LIVE
    : process.env.DEV === "true"
    ? "http://127.0.0.1:3000"
    : process.env.IP_LOCAL + ":5000";

app.use(
  cors({
    origin,
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(helmet());

if (process.env.NODE_ENV === "production") {
  const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.MAX_REQ_RATE_IN_15_MINUTES,
    message: "Too many requests",
      handler: function(req, res /*, next*/) {
        res.status(429).send({error: "Too many requests"});
      },
  });
  app.use(rateLimiter);
}

/*app.use(blacklist.blockRequests('logs/blacklist.txt'));
app.use(expressDefend.protect({
    maxAttempts: 5,
    dropSuspiciousRequest: true,
    logFile: 'logs/suspicious.log',
    onMaxAttemptsReached: function(ipAddress, url){
        blacklist.addAddress(ipAddress);
    }
}));*/

const sess = {
  secure: process.env.NODE_ENV === "production",
  secret: process.env.sessionSecret,
  resave: true,
  saveUninitialized: true,
  store: new MemoryStore({
    checkPeriod: process.env.API_KEY_DURATION * 60 * 60 * 1000, // prune expired entries every 2h
  }),
  cookie: {},
  maxAge: Date.now() + process.env.API_KEY_DURATION * 60 * 60 * 1000, //2 hours
};

if (process.env.NODE_ENV === "production") {
  sess.cookie.sameSite = "none"; // chrome 80+ fix
  sess.cookie.secure = true; // serve secure cookies
  app.set("trust proxy", 1); // trust first proxy
}

app.use(session(sess));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Hot reload!
// ALL server routes are in this module!
app.use((req, res, next) => {
  require("./app/router")(req, res, next);
});

// ...

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`> Ready on ${origin}:${port}`);
  console.log("CHRYSALIS: " + process.env.IOTA_CHRYSALIS);
  console.log(
    "NODE: " +
      (parseInt(process.env.IOTA_CHRYSALIS)
        ? process.env.iotaNode_chrysalis
        : process.env.iotaNode)
  );
});

module.exports = {
  init: function (cb) {},
};
