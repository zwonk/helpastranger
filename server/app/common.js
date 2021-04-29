const axios = require("axios");
const mysql = require("mysql");
const QRCode = require("qrcode");
const crypto = require("./crypto.js");
const db = require("./db.js");
const utils = require("./utils.js");
const iotaH = require("./iotaWrapper.js");

const constants = require("./constants.js");

var debounceExchangeVar = false;

const {
  DOMAIN_URL,
  QR_SITE,
  MI,
  CRNCY,
  DEFAULT_ERROR,
  PLAUSBILITY_LOCATION_DISTANCE,
  PLAUSBILITY_LOCATION_MONTHS,
  PLAUSBILITY_LOCATION_COUNT,
  PLAUSBILITY_LOCATION_RATIO,
  MAX_DESCRIPTION_INPUT,
  USERS,
  USERSDATA,
  ADMINS,
  AFFECTED,
  AFFECTEDDATA,
  RECURRENT_PAYMENTS,
  QR_CODES,
  DONATIONS,
  SAVED,
  CASHOUTS,
  WITHDRAWS,
  LOCATIONS,
  EDITS,
  CAMPAIGNS,
  CAMPAIGNS_WITHDRAWALS,
} = constants;

let iota_price_rates = {};

var self = (module.exports = {
  ...constants,

  createQrCode: async function (public_key, qr_low_res) {
    const content = DOMAIN_URL + QR_SITE + public_key;
    const qr_code = await QRCode.toDataURL(content, {
      errorCorrectionLevel: "H",
      width: qr_low_res ? 350 : 1500, //DPI 300 = 1500, 72 = 350
      color: {
        dark:"#000000",
        light:"#0000" //transparent
      }
    });
    return qr_code;
  },

  stripPublicKey: function (public_key) {
    const public_key_arr = public_key.split("/");
    return !public_key_arr || public_key_arr.length === 0
      ? ""
      : public_key_arr[public_key_arr.length - 1];
  },

  getAffectedPublicKey: async function (req) {
    const { affected_id } = req.body;

    const internalReq1 = { params: { idType: AFFECTED, id: affected_id } };
    const permissionRequired = false;
    const idFromUser = true;
    const affectedData = await db.getHandler(
      AFFECTEDDATA,
      internalReq1,
      permissionRequired,
      idFromUser
    );

    if (affectedData && affectedData.length === 1) {
      if (affectedData[0].curr_public_key != null) {
        return affectedData[0].curr_public_key;
      }
    }

    return { error: "No code available. Please create one." };
  },

  getAffectedBalance: async function (req) {
    const { id, crncy } = req.body; //id is correct

    const crncy_post = crncy || self.CRNCY;

    const permissionRequired = false;
    const idFromUser = true;
    const internalReq1 = { params: { idType: AFFECTED, id } };
    let affectedData = await db.getHandler(
      AFFECTEDDATA,
      internalReq1,
      permissionRequired,
      idFromUser
    );

    if (!affectedData || affectedData.error || affectedData.length === 0) {
      return affectedData;
    }
    affectedData = affectedData[0];

    const { curr_public_key } = affectedData;
    const res = await iotaH.iotaGetBalance({ body: { curr_public_key } });
    if (!res || !res.balance || res.error) {
      return { error: res ? res.error : DEFAULT_ERROR };
    }

    let fiat_balance = await self.iota_to_fiat(crncy_post, res.balance.balance);
    if (fiat_balance != null && !fiat_balance.error) {
      fiat_balance = fiat_balance[crncy_post] * 100; //because hector fiat
    } else {
      fiat_balance = null;
    }

    console.log("affectedBalance", res.balance)

    return {
      balance: res.balance.balance,
      dustAllowed: res.balance.dust_allowed,
      fiat_balance: Number(Number(fiat_balance).toFixed(2)),
      crncy: crncy_post,
    };
  },

  createQrCodeForAffected: async function (affected_id, qr_low_res) {
    if (affected_id == null) {
      return { error: "Affected Id needs to be created first" };
    }

    const internalReq1 = { params: { idType: AFFECTED, id: affected_id } };
    const permissionRequired = false;
    const idFromUser = true;

    const affectedData = await db.getHandler(
      AFFECTEDDATA,
      internalReq1,
      permissionRequired,
      idFromUser
    );
    if (
      !affectedData ||
      affectedData.length !== 1 ||
      affectedData[0].priv_key == null
    ) {
      return { error: "Resource not properly created." };
    }
    const affected = affectedData[0];

    const public_key = affected.curr_public_key;
    if (!public_key) {
      return { error: "Resource not properly created." };
    }

    const qr_codes = await db.getHandler(
      QR_CODES,
      internalReq1,
      permissionRequired,
      idFromUser
    );
    if (qr_codes && qr_codes.length > 0) {
      return { error: "Qr code already exists" };
    }

    let qr_blob = null;
    if (!public_key) {
      return { error: "Key invalid" };
    }

    qr_blob = await self.createQrCode(public_key, qr_low_res);
    if (!qr_blob) {
      return { error: "Can't create qr code" };
    }

    return { public_key, qr_blob };
  },

  getAllAddresses: async function (priv_key) {
    return iotaH.iotaGetAllAddresses(priv_key); //only for debug
  },

  createPublicKey: async function (decrypted_priv_key) {
    return iotaH.iotaGetAddress({ body: { decrypted_priv_key } });
  },

  createDonationForAffected: async function (
    affected_id,
    amount,
    priv_key,
    userData
  ) {
    //TODO spam protection for amount 0 but not donation_free=1 (platform donation)
    /*if(process.env.NODE_ENV === 'production' && amount <= 0){
			return {error: "Can't create zero value donation."}
		}*/

    /* get affected person data **/
    const internalReq1 = { params: { idType: AFFECTED, id: affected_id } };
    const permissionRequired1 = false;
    const idFromUser = true;
    const affectedData = await db.getHandler(
      AFFECTEDDATA,
      internalReq1,
      permissionRequired1,
      idFromUser
    );

    if (!affectedData || (affectedData && affectedData.length !== 1)) {
      return { error: "Resource not found." };
    }

    const affected = affectedData[0];
    const address = affected.curr_public_key;

    console.log("--SEND");
    const { tx, error, remainderAddress } = parseInt(process.env.IOTA_CHRYSALIS)
      ? await iotaH.iotaSend({
          body: {
            priv_key,
            address,
            amount,
          },
        })
      : await iotaH.iotaSend({
          body: {
            priv_key,
            address,
            amount,
            source_address: userData.curr_public_key,
            source_address_index: userData.curr_public_key_index,
            addressIndexIteration: 1,
            nextAddress: null,
          },
        });
    console.log("--AFTER THIS");

    if (error) {
      return { error };
    }

    if (!tx || tx.length === 0 || tx[0].hash == null) {
      return { error: DEFAULT_ERROR };
    }

    if (!parseInt(process.env.IOTA_CHRYSALIS)) {
      //update user curr_public_key record
      const internalReq2 = {
        params: { id: userData.users_id },
        body: {
          curr_public_key: remainderAddress,
          curr_public_key_index: userData.curr_public_key_index + 1,
        },
      };
      const permissionRequired2 = false;
      const postViaUserId = true;
      const apiAsId = true;
      await db.postHandler(
        USERSDATA,
        internalReq2,
        permissionRequired2,
        apiAsId,
        postViaUserId
      );
    }

    return { tx };
  },

  resetSaved: async function (secret, donations_id) {
    const resetSavedSQL = `UPDATE saved as t
                    SET t.donations_id = ${mysql.escape(donations_id)}
								 WHERE t.secret = ?`;

    return await db.customSQL(resetSavedSQL, [secret]);
  },

  manualSave: async function (secret) {
    let resetSavedSQL;
    if (secret) {
      resetSavedSQL = `UPDATE saved as t
      SET t.manual_save = 1
      WHERE t.secret = ?
      `;
    } else {
      return false;
    }

    return await db.customSQL(resetSavedSQL, [secret]);
  },

  //NOTE currently unused
  createDonationForCampaign: async function (
    campaigns_id,
    amount,
    priv_key,
    userData
  ) {

    if(process.env.NODE_ENV === 'production' && amount <= 0){
			return {error: "Can't create zero value donation."}
    }

    let campaign = await db.simpleGetHandler(CAMPAIGNS, {
      body: { id: campaigns_id },
    });
    if (!campaign || (campaign && campaign.length !== 1))
      return { error: "Campaign not found." };

    campaign = campaign[0];

    console.log("--SEND");
    const { tx, error } = await iotaH.iotaSend({
      body: {
        priv_key,
        address: campaign.campaign_address,
        amount,
      },
    });

    console.log("--AFTER THIS");
    if (error) {
      return { error };
    }

    if (!tx || tx.length === 0 || tx[0].hash == null) {
      return { error: DEFAULT_ERROR };
    }

    return { tx };
  },

  cacheExchangeRateVar: async function (crncy) {
    const url =
      "https://api.nomics.com/v1/currencies/ticker?key=" +
      process.env.NOMICS_API_KEY;
    const urlWithParams = url + "&ids=IOT&interval=1d&convert=" + crncy;

    try {
      const res = await axios({
        method: "GET",
        url: urlWithParams,
      });

      let resOK = res && res.status === 200 && res.statusText === "OK";

      if (resOK) {
        let data = await res.data;
        if (data && data.length > 0 && data[0].price !== undefined) {
          iota_price_rates = {
            ...iota_price_rates,
            [crncy]: { timestamp: Date.now(), rate: data[0].price },
          };

          return { rate: data[0].price };
        }
      } else {
        console.log({ error: "Couldn't get currency rate." });
        throw new Error("Couldn't get currency rate.");
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.log({ error: "Couldn't get currency rate." });
        throw err;
      } else {
        throw new Error("Couldn't get currency rate.");
      }
    }
  },

  getExchangeRateVar: async function (crncy) {
    let res;
    const MAX_PRICE_FETCH_TIME = 10000;
    const PRICE_FETCH_INTV = 2000;

    if(
      iota_price_rates[crncy] && 
      (Date.now() - iota_price_rates[crncy].timestamp <
      process.env.IOTA_PRICE_UPDATE_INTERVAL)
    ) {
      res = { rate: iota_price_rates[crncy].rate };
      return res.rate
    } else {
      iota_price_rates[crncy] = null
    }

    if (!iota_price_rates[crncy]) {

      console.log("Fetch currency course.", crncy)

      let price_fetch_time = 0;

      /* debounced fetching*/

      await new Promise((resolve, reject) => {
        let debounceIntv = setInterval(async () => {

          /* max timeout */
          if(price_fetch_time > MAX_PRICE_FETCH_TIME){
            res = {rate: null}
            debounceExchangeVar = false;
            clearInterval(debounceIntv)
            resolve(true)
          }

          price_fetch_time += PRICE_FETCH_INTV;
          if(!debounceExchangeVar){
            if(!iota_price_rates[crncy]){
              try {
                debounceExchangeVar = true;
                res = await self.cacheExchangeRateVar(crncy);
              } catch(err){
                res = {error: true}
              }
              if(res && res.error == null){
                debounceExchangeVar = false;
                clearInterval(debounceIntv)
                resolve(true)
              }
            } else {
              res = iota_price_rates[crncy]
              debounceExchangeVar = false;
              clearInterval(debounceIntv)
              resolve(true)
            }
          }
          }, PRICE_FETCH_INTV)
        }
      )

      return res.rate;
    }

  },

  fiat_to_iota: async function (crncy, amount) {
    const rate = await self.getExchangeRateVar(crncy);
    if (!rate || rate.error) {
      return rate;
    }

    return { iota: (((1.0 / parseFloat(rate)) * 100 * amount) / 100) * MI };
  },

  iota_to_fiat: async function (crncy, amount) {
    const rate = await self.getExchangeRateVar(crncy);
    if (!rate || rate.error) {
      return rate;
    }
    return { [crncy]: (parseFloat(rate) * 100 * parseInt(amount)) / 100 / MI };
  },

  reverseGeo: async function (data) {
    const { x, y } = data;

    try {
      const url = "https://nominatim.openstreetmap.org/reverse?";

      if (x && y) {
        const urlWithParams = url + "lat=" + x + "&lon=" + y + "&format=json";

        const res = await axios({
          method: "GET",
          url: urlWithParams,
        });

        let resOK = res && res.status === 200 && res.statusText === "OK";

        if (resOK) {
          data = await res.data;

          if (data && data.address) {
            return {
              address:
                data.address.road +
                ", " +
                data.address.suburb +
                ", " +
                data.address.city,
            };
          }
        }
      }

      return null;
    } catch (e) {
      console.err(e);
      return null;
    }
  },

  generatePrivateKey: function () {
    const { mnemonic, seed } = iotaH.iotaGenerateSeed();
    return { mnemonic: crypto.encrypt(mnemonic), seed: crypto.encrypt(seed) };
  },

  handlePassw: function (passw, evalOnly = false) {
    /*
		 eight characters or more and has at least one lowercase and one uppercase alphabetical character or has at least one lowercase and one numeric character or has at least one uppercase and one numeric character. We’ve chosen to leave special characters out of this one.
		 */
    //TODO regex loop safe?
    let pepper = process.env.pepper;

    if (!evalOnly) {
      var mediumRegex = new RegExp(
        "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})"
      );

      if (!mediumRegex.test(passw)) {
        return null;
      }
    }

    return utils.getSHA256ofJSON(passw + pepper + passw);
  },

  getUsersIdFromApiKey: async function (apiKey) {
    const user = await db.simpleGetHandler(USERS, { body: { apiKey } });

    if (!user || user.length !== 1) {
      return null;
    } else {
      return user[0].id;
    }
  },

  getAdminsIdFromApiKey: async function (apiKey) {
    const user = await db.simpleGetHandler(ADMINS, { body: { apiKey } });

    if (!user || user.length !== 1) {
      return null;
    } else {
      return user[0].id;
    }
  },

  checkLimits: async function (table, users_id, apiKey) {
    //TODO create EDITS, LOCATIONS, DONATIONS per affected limits

    console.log("checkLimits");

    if (process.env.NODE_ENV !== "production") {
      return true;
    }

    const USERS_LIMIT_TABLE_WEEKLY = {
      [USERS]: 100,
      [USERSDATA]: 100,
      [AFFECTED]: 100,
      [AFFECTEDDATA]: 100,
      [LOCATIONS]: 100,
      [EDITS]: 100,
      [QR_CODES]: 100,
      [DONATIONS]: 200,
      [SAVED]: 500,
      [CASHOUTS]: 30,
      [WITHDRAWS]: null,
      [CAMPAIGNS]: 30,
      [CAMPAIGNS_WITHDRAWALS]: null,
      [RECURRENT_PAYMENTS]: 100,
    };
    const USERS_LIMIT_TABLE_DAILY = {
      ...USERS_LIMIT_TABLE_WEEKLY,
      [QR_CODES]: 100,
      [USERSDATA]: 5,
      [WITHDRAWS]: null,
      [CASHOUTS]: 10,
      [CAMPAIGNS]: 5,
      [SAVED]: 200,
    };
    const PUBLIC_LIMIT_TABLE_WEEKLY = {
      [USERS]: 10000,
      [AFFECTED]: 10000,
      [USERSDATA]: 10000,
      [AFFECTEDDATA]: 10000,
      [RECURRENT_PAYMENTS]: 10000,
      [QR_CODES]: 10000,
      [DONATIONS]: 10000,
      [SAVED]: 10000,
      [CASHOUTS]: 10000,
      [WITHDRAWS]: 10000,
      [CAMPAIGNS]: 1000,
      [LOCATIONS]: 1000,
      [EDITS]: 10000,
      [CAMPAIGNS_WITHDRAWALS]: null,
    };
    const PUBLIC_LIMIT_TABLE_DAILY = {
      ...PUBLIC_LIMIT_TABLE_WEEKLY,
    };

    let limit;
    const first = true;

    //1) user specific limit
    if (users_id != null || apiKey != null) {
      if (USERS_LIMIT_TABLE_WEEKLY[table] !== null) {
        let userIdentSql = ` WHERE tabusersdata.users_id = ${mysql.escape(
          users_id
        )} `;
        if (apiKey !== null) {
          userIdentSql = ` WHERE tabusers.apiKey = ${mysql.escape(apiKey)} `;
        }

        const first = true;
        const daily_limit_query = `SELECT COUNT(DISTINCT ${table}.id) as count FROM ${table}
										RIGHT JOIN ${USERSDATA} as tabusersdata ON ${table}.users_id = tabusersdata.id
										RIGHT JOIN ${USERS} as tabusers ON ${table}.users_id = tabusers.id
										${userIdentSql}
										AND ${table}.updated_at > CURDATE() - INTERVAL 1 DAY;
										`;
        const weekly_limit_query = `SELECT COUNT(DISTINCT ${table}.id) as count FROM ${table}
										RIGHT JOIN ${USERSDATA} as tabusersdata ON ${table}.users_id = tabusersdata.id
										RIGHT JOIN ${USERS} as tabusers ON ${table}.users_id = tabusers.id
										${userIdentSql}
										AND ${table}.updated_at >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY;
										`;
        console.log("Daily user limit: " + USERS_LIMIT_TABLE_DAILY[table]);

        limit = await db.customSQL(daily_limit_query, [], [], first);
        if (!limit || limit.count > USERS_LIMIT_TABLE_DAILY[table]) {
          return { error: "Daily limit reached" };
        }
        console.log("current user daily limit reached:");
        console.log(limit);

        limit = await db.customSQL(weekly_limit_query, [], [], first);

        console.log("current user weekly limit reached:");
        console.log(limit);
        if (!limit || limit.count > USERS_LIMIT_TABLE_WEEKLY[table]) {
          return { error: "Weekly limit reached" };
        }
      }
    }

    //2) public limit
    const public_daily_limit_query = `SELECT COUNT(DISTINCT ${table}.id) as count FROM ${table}
								WHERE ${table}.updated_at > CURDATE() - INTERVAL 1 DAY;
								`;
    const public_weekly_limit_query = `SELECT COUNT(DISTINCT ${table}.id) as count FROM ${table}
								WHERE ${table}.updated_at >= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY;
								`;

    //console.log("Daily public limit: " + PUBLIC_LIMIT_TABLE_DAILY[table]);

    if (PUBLIC_LIMIT_TABLE_WEEKLY[table] !== null) {
      limit = await db.customSQL(public_daily_limit_query, [], [], first);

      //console.log("current daily public limit:");
      //console.log(limit);

      if (!limit || limit.count > PUBLIC_LIMIT_TABLE_DAILY[table]) {
        return { error: "Public daily limit reached" };
      }

      limit = await db.customSQL(public_weekly_limit_query, [], [], first);

      //console.log("current weekly public limit:");
      //console.log(limit);
      
      if (!limit || limit.count > PUBLIC_LIMIT_TABLE_WEEKLY[table]) {
        return { error: "Public weekly limit reached" };
      }
    }

    return { error: null };
  },

  checkLocationPlausibility: async function (bodyParams) {
    let { affected_id, x, y } = bodyParams;

    if(process.env.NODE_ENV === "debug"){
      return true;
    }

    console.log("checkLocationPlausibility");

    if (!x || !y) return { error: "No location provided" };

    //check if no location given
    const existent_query = `select affected_id from ${LOCATIONS}
              WHERE affected_id = ? 
              AND created_at >= NOW() - INTERVAL ${PLAUSBILITY_LOCATION_MONTHS} MONTH
              ORDER BY created_at DESC
              LIMIT ${PLAUSBILITY_LOCATION_COUNT} 
              `;

    const existent = await db.customSQL(existent_query, [affected_id], []);
    if (!existent || existent.error) {
      return existent;
    }

    //check if none of the historic locations is plausible
    const plausbility_query = `select affected_id, x, y from ${LOCATIONS}
            WHERE affected_id = ?
            AND ST_Distance_Sphere(point(x, y), point(?, ?)) < ${PLAUSBILITY_LOCATION_DISTANCE}
            AND created_at >= NOW() - INTERVAL ${PLAUSBILITY_LOCATION_MONTHS} MONTH
            ORDER BY created_at DESC
            LIMIT ${PLAUSBILITY_LOCATION_COUNT}
            `;
    const plausibility = await db.customSQL(
      plausbility_query,
      [affected_id, parseFloat(x), parseFloat(y)],
      []
    );
    if (!plausibility || plausibility.error) {
      return plausibility;
    }

    if (
      existent.length === 0 ||
      (existent.length > 0 &&
        plausibility.length > 0 &&
        parseFloat(plausibility.length) / parseFloat(existent.length) >
          PLAUSBILITY_LOCATION_RATIO)
    ) {
      return true;
    } else return false;
  },

  createLocation: async function (affected_id, bodyParams, users_id, apiKey) {
    if (affected_id == null) {
      return { error: "Need to specify an affected_id." };
    }

    const plausible = await self.checkLocationPlausibility(bodyParams);
    if (!plausible) return { error: "Unplausible location." };

    const limitsResult = await self.checkLimits(LOCATIONS, null, apiKey);
    if (limitsResult.error) {
      return { error: limitsResult.error };
    }

    /* check input length */
    if (
      bodyParams.location_description &&
      bodyParams.location_description.toString().length > MAX_DESCRIPTION_INPUT
    ) {
      return { error: "Input too long. Max allowed 100 characters" };
    }

    const geo = await self.reverseGeo(bodyParams);
    const location_address = geo ? geo.address : null;

    const internalReq = {
      params: { apiKey },
      body: { ...bodyParams, users_id, location_address },
    };
    const permissionRequired = false;
    return db.putHandler(LOCATIONS, internalReq, permissionRequired);
  },

  createSaved: async function (
    affected_id,
    qr_code,
    secretPost,
    manual_save,
    users_id,
    apiKey
  ) {
    let saved;

    if (manual_save) {
      let put = await self.manualSave(secretPost);
      if (!put || put.error) {
        return put;
      }
      const internalReq = { body: { secret: secretPost } };
      saved = await db.simpleGetHandler(SAVED, internalReq);
      if (!saved || saved.error) {
        return saved;
      }
    } else {
      const saved_id = utils.uuidv4();
      const internalReq = {
        params: { apiKey },
        body: {
          id: saved_id,
          users_id,
          affected_id,
          manual_save,
          qr_code,
          secret: secretPost,
        },
      };
      const permissionRequired = false;

      const put = await db.putHandler(SAVED, internalReq, permissionRequired);

      if (!put || put.error || put.insertId == null) {
        return put;
      }

      const permissionRequired1 = false;
      const internalReq1 = { params: { idType: USERS, id: saved_id } };
      saved = await db.getHandler(SAVED, internalReq1, permissionRequired1);

      if (!saved || saved.error || saved.length === 0) {
        return saved;
      }

    }

    saved = saved[0];
    return saved;
  },

  fiatSumCrncyAggregator: async function (res, defaultCrncy = CRNCY, columns = null, merge = false){
    if(!res || res.length === 0){
      return res;
    }

    if(columns){
      columns = columns.map(c => c+"_")
    } else {
      columns = [""]
    }

    const subs = [];
    const subsIdx = [];

    const columnResults = await Promise.all(columns.map(async(column, i) => {

      res.forEach((sub)=> {

        if(sub){ /*&& sub[`${column}fiat_amount_sum`] !== null*/
          if(!subsIdx.includes(sub.affected_id)){
            subsIdx.push(sub.affected_id)
            subs[subsIdx.length-1] = []
          }
          subs[subsIdx.findIndex(x => x === sub.affected_id)].push(sub);
        }
      })

     return await Promise.all(subs.map(async (sub) => {
      if(sub.length > 1){
        const crncy = defaultCrncy;

        let fiat_amount_sum = await Promise.all(res.map(async (sub) => {
        if(sub[`${column}crncy`] !== null){
          const iota = await self.fiat_to_iota(sub[`${column}crncy`], sub[`${column}fiat_amount_sum`])
          if(iota == null || iota.error){
            return iota
          }
          const fiat = await self.iota_to_fiat(defaultCrncy, iota.iota)
          if(fiat == null || fiat.error){
            return fiat
          }
          return await fiat[crncy];
        } else {
          return null;
        }
      }));

        if (fiat_amount_sum == null || fiat_amount_sum.error) {
          return fiat_amount_sum;
        }
        
        let donations_count = 0;
        fiat_amount_sum = fiat_amount_sum.reduce((a, b) => a + b)
        donations_count = res.reduce((a, b) => a + Number(b[`${column}count`]), 0)

        if(i === 0){
          return {
            ...sub[0],
            crncy,
            [`${column}fiat_amount_sum`]: fiat_amount_sum ? Math.trunc(fiat_amount_sum) : fiat_amount_sum,
            [`${column}count`]: donations_count,
          }
        } else {
          return {
            [`${column}fiat_amount_sum`]: fiat_amount_sum ? Math.trunc(fiat_amount_sum) : fiat_amount_sum,
            [`${column}count`]: donations_count,
          }
        }
      } else {
        return sub[0];
      }
    }));

  }))

  let finalResult = {};
  if(merge){
    columnResults.forEach(c => {
      if(c && c.length > 0){
        finalResult = {...finalResult, ...c[0]}
      }
    })
    return finalResult;
  }
  else {
    let contentItems;
    if(columnResults.length > 0){
      if(columnResults[0].length > 0){
        contentItems = columnResults[0].length
      }
    }

    finalResult = Array(contentItems);
    columnResults.forEach((c, i) => {
      if(c && c.length > 0){
        c.forEach((cc, ii) => {
          finalResult[ii] = {...finalResult[ii], ...cc}
        })
      }
    })
    return finalResult;
  }

}

});
