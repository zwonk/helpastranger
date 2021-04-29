const router = require("express").Router();
const axios = require("axios");

const CAPTCHA_EXEMPT = [
  "donations_get",
  "a_donations_get",
  "qr_codes_get_platform_count",
  "a_users_get_balance",
  "a_users_get_data",
  "a_donations_and_saved_get_all",
  "a_qr_codes_get_all_with_stats",
  "a_withdraws_get_all",
  "a_cashouts_get_all",
  "affected_get_data_package",
  "locations_get_all",
  "a_saved_create",
  "saved_create",
  "get_memes",
  "locations_get_all_for_city",
  "affected_public_key_from_qr", //TODO remove
];

async function verifyCaptcha(req, res, next, fn) {
  fn = req.params.function || fn;

  if (
    process.env.RECAPTCHA_ACTIVE === "false" ||
    (fn !== undefined && CAPTCHA_EXEMPT.includes(fn))
  ) {
    next();
    return;
  }

  if (req.query && req.query.token) {
    const token = req.query.token;
    const url = "https://www.google.com/recaptcha/api/siteverify";
    //const url = "https://hcaptcha.com/siteverify";

    try {
      var user_ip =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      const res = await axios({
        method: "POST",
        url,
        params: {
          secret: process.env.RECAPTCHA_KEY,
          response: token,
        },
      });

      let resOK = res && res.status === 200 && res.statusText === "OK";

console.log(res.data.action)
console.log(fn)
console.log("\n")
      if (resOK) {
        if (
          res.data &&
          res.data.success /*TODO invert captcha scores */ &&
          res.data.score > parseFloat(process.env.RECPATCHA_SCORE_THRESH) &&
          res.data.action === fn
        ) {
          next();
          return;
        } else {
          if (process.env.DEV === "true")
            throw new Error("Verification failed. Try again later.");
        }
      }
    } catch (err) {
      if (process.env.DEV === "true") throw err;
    }
  }

  res.send({ error: "Our strict security measures kicked in. Just try again." });
  res.end();
  return;
}

router.post(`/auth((?!(/admin)).)/:token?`, async function (req, res, next) {
  return verifyCaptcha(req, res, next, "auth");
});

router.post(`/auth/admin/:token?`, async function (req, res, next) {
  return verifyCaptcha(req, res, next, "admin");
});

router.post(`/api/:function/:token?`, async function (req, res, next) {
  return verifyCaptcha(req, res, next);
});




module.exports = router;
