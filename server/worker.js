let throng = require("throng");
let Queue = require("bull");
const api = require("./app/api.js").api;
const db = require("./app/db.js");
const iotaH = require("./app/iotaWrapper.js");

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

// The maximum number of jobs each worker should process at once. This will need
// to be tuned for your application. If each job is mostly waiting on network
// responses it can be much higher. If each job is CPU-intensive, it might need
// to be much lower.
let maxJobsPerWorker = 50;

if (process.env.NODE_ENV === "production"
  && process.env.DEV === "false") {
    console.log = function () { };
}

function start() {
  // Connect to the named work queue
  let workQueue = new Queue("work", REDIS_URL);

  workQueue.process(maxJobsPerWorker, async (job, done) => {
    try {
      console.log(api[job.data.api][job.data.fn]);
      console.log(db);
      await api[job.data.api][job.data.fn](job.data.req, db, iotaH);
    } catch (e) {
      done(new Error(e));
    }

    // A job can return values that will be stored in Redis as JSON
    // This return value is unused in this demo application.
    done();
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });
