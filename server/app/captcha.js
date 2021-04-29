const router = require("express").Router();
const axios = require("axios");

const CAPTCHA_EXEMPT = [
  "donations_get",
  "a_donations_get",
  "locations_get_all_for_city",
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
  "affected_public_key_from_qr", //TODO remove
];

router.post(`/*/:function/:token?`, async function (req, res, next) {
  let fn = req.params.function;

  if (process.env.RECAPTCHA_ACTIVE === "false" || CAPTCHA_EXEMPT.includes(fn)) {
    next();
    return;
  }

  if (req.query && req.query.token) {
    const token = req.query.token;
    const url = "https://www.google.com/recaptcha/api/siteverify";

    try {
      const res = await axios({
        method: "POST",
        url,
        params: {
          secret: process.env.RECAPTCHA_KEY,
          response: token,
        },
      });

      let resOK = res && res.status === 200 && res.statusText === "OK";

      if (resOK) {
        if (
          res.data &&
          res.data.success &&
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

  res.send({ error: "An error occured. Try again later." });
  res.end();
  return;
});

module.exports = router;
