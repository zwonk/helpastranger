const mysql = require("mysql");
const utils = require("../utils.js");

const {
  LIMIT,
  DEFAULT_ERROR,
  USERS,
  AFFECTED,
  USERSDATA,
  AFFECTEDDATA,
  CASHOUTS,
  LOCATIONS,
  IOTA_DUST_OUTPUT_ALLOWANCE,
  getUsersIdFromApiKey,
  checkLimits,
  iota_to_fiat,
  createLocation,
  getAffectedBalance,
} = require("../common.js");

module.exports = {
  private: {
    /**
     * Create Cashouts
     *
     * @param      {default}  body     users_id, affected_id, landing_address (valid iota address)
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | {cashouts_id}
     */
    a_cashouts_create: async function (req) {
      const { affected_id, x, y, crncy } = req.body;
      const apiKey = req.session.apiKey;

      /* create location for cashout and check location plausibility */

      const users_id = await getUsersIdFromApiKey(apiKey);

      const location = await createLocation(
        affected_id,
        { affected_id, x, y },
        users_id,
        apiKey
      );
      if (!location || location.error) {
        return location;
      }

      if (affected_id == null) {
        return { error: "Affected Id is empty" };
      }

      const balance = await getAffectedBalance({ body: { id: affected_id, crncy } });
      if (!balance || balance.error) {
        return balance;
      }

      const amount = balance.balance;

      if (parseInt(amount) === 0)
        return { error: "Can't cash out empty account." };

      if (amount < IOTA_DUST_OUTPUT_ALLOWANCE
        && (!balance || !balance.dustAllowed)) {
         return {
          error:
            "Cashout only possible for balances higher than 1 MIOTA.",
        };   
      }

      /* also convert to fiat amount */
      let fiat_amount = await iota_to_fiat(crncy, amount);
      if (fiat_amount.error) {
        return { error: fiat_amount.error };
      }
      fiat_amount = fiat_amount[crncy] * 100; //because everything is in hecto fiat format;

      /* check if user has rights to cashout */

      const query1 = `SELECT users_id, priv_key, curr_public_key_index, curr_public_key FROM ${USERS}
							RIGHT JOIN ${USERSDATA} ON ${USERSDATA}.users_id = ${USERS}.id
							WHERE ${USERS}.apiKey = ?
							AND ${USERSDATA}.member_state > 0
							AND ${USERSDATA}.flagged IS NULL
							`;

      const first = true;
      const user = await this.db.customSQL(
        query1,
        [req.session.apiKey],
        [],
        first
      );
      if (!user) {
        return { error: "Not allowed to cashout" };
      }

      /* get user limit */

      const limitsResult = await checkLimits(CASHOUTS, null, apiKey);
      if (limitsResult.error) {
        return { error: limitsResult.error };
      }

      /* write cashout */

      const id = utils.uuidv4();
      const bodyParamsNew = {
        id,
        users_id,
        affected_id,
        amount,
        fiat_amount,
        crncy,
        landing_address: user.curr_public_key,
      };
      const internalReq3 = { params: { apiKey }, body: bodyParamsNew };
      const permissionRequired3 = false;
      const put = await this.db.putHandler(
        CASHOUTS,
        internalReq3,
        permissionRequired3
      );
      if (!put || put.error || put.insertId == null) {
        return put;
      }

      const cashouts_id = id;

      /* associate location with cashout */

      const internalReq4 = {
        params: { idType: USERS, id: location.id },
        body: { cashouts_id },
      };
      const permissionRequired4 = true;
      const res = await this.db.postHandler(
        LOCATIONS,
        internalReq4,
        permissionRequired4
      );
      if (!res || res.error) {
        return { error: res ? res.error : res };
      }

      return { cashouts_id };
    },

    /**
     * Send Cashout Funds
     *
     * @param      {default}  body     cashouts_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default} true
     */
    a_cashouts_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_cashouts_send_worker",
        req: { body, session },
      });

      return true;
    },

    a_cashouts_send_worker: async function (req, db, iotaH) {
      //TODO time limit how old transactions can be processes to prevent
      //stacking prepared cashouts

      async function proc(req) {
        const { cashouts_id } = req.body;
        const apiKey = req.session.apiKey;

        /* get current users_id via apiKey **/

        const users_id = await getUsersIdFromApiKey(apiKey);

        /* get current user */

        const permissionRequired = true;
        const idFromUser = true;
        let user = await db.getHandler(
          USERSDATA,
          { params: { idType: USERS, id: users_id, apiKey } },
          permissionRequired,
          idFromUser
        );
        if (user == null || (user && user.length !== 1)) {
          return { error: "Resource can't be loaded." };
        }
        user = user[0];

        /* check if cashout is by user */

        const permissionRequired1 = true;
        let cashout = await db.getHandler(
          CASHOUTS,
          { params: { idType: USERS, id: cashouts_id, apiKey } },
          permissionRequired1
        );

        if (!cashout || (cashout && cashout.length !== 1))
          return { error: "Cashout not accessible." };
        cashout = cashout[0];

        if (cashout.txhash) {
          return { error: "Cashout already executed." };
        }

        /* get affected priv_key */

        const internalReq2 = {
          params: { idType: AFFECTED, id: cashout.affected_id },
        };
        const permissionRequired2 = false;
        const idFromUser2 = true;
        let affectedData = await db.getHandler(
          AFFECTEDDATA,
          internalReq2,
          permissionRequired2,
          idFromUser2
        );
        if (
          !affectedData ||
          affectedData.length !== 1 ||
          affectedData[0].priv_key == null
        ) {
          return { error: "Resource not found." };
        }
        affectedData = affectedData[0];

        if (!affectedData.curr_public_key) {
          return { error: "Resource not properly created." };
        }

        const priv_key = affectedData.priv_key;

        /* send funds on iota network */

        console.log("------BEFORE SEND");

        const { tx, error, remainderAddress } = parseInt(process.env.IOTA_CHRYSALIS)
          ? await iotaH.iotaSend({
              body: {
                priv_key,
                address: cashout.landing_address,
                amount: cashout.amount,
              },
            })
          : await iotaH.iotaSend({
              body: {
                priv_key: priv_key,
                address: cashout.landing_address,
                amount: cashout.amount,
                source_address: affectedData.curr_public_key,
                source_address_index: affectedData.curr_public_key_index,
                addressIndexIteration: 1,
                nextAddress: true,
              },
            });

        if (!tx || tx.length === 0 || error || tx[0].hash == null) {
          return { error: tx ? tx.error : error || DEFAULT_ERROR };
        }

        console.log("------AFTER SEND");

        if (!parseInt(process.env.IOTA_CHRYSALIS)) {
          const internalReq3 = {
            params: { idType: AFFECTED, id: cashout.affected_id },
            body: {
              curr_public_key: remainderAddress,
              curr_public_key_index: affectedData.curr_public_key_index + 1,
            },
          };
          const permissionRequired3 = false;
          const apiAsId = false;
          const postViaUserId = true;
          const res = await db.postHandler(
            AFFECTEDDATA,
            internalReq3,
            permissionRequired3,
            apiAsId,
            postViaUserId
          );
          if (!res || res.error) {
            return { error: res ? res.error : res };
          }
        }

        return { error: 0, txhash: tx[0].hash };
      }

      const { cashouts_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash } = await proc(req);

      /* update cashouts */

      const internalReq = {
        params: { id: cashouts_id, apiKey },
        body: { error, txhash },
      };
      const permissionRequired4 = true;
      await db.postHandler(
        CASHOUTS,
        internalReq,
        permissionRequired4,
        false,
        false,
        " AND txhash IS NULL "
      );
    },

    /**
     * Get cashout
     *
     * @param      {default}  body     { cashouts_id }
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result object
     */
    a_cashouts_get: async function (req) {
      const { cashouts_id } = req.body;
      const apiKey = req.session.apiKey;

      const internalReq = {
        params: { idType: USERS, id: cashouts_id, apiKey: apiKey },
      };

      const permissionRequired = false;
      const res = await this.db.getHandler(
        CASHOUTS,
        internalReq,
        permissionRequired
      );

      return res;
    },

    /**
     * Get Currently Associated Cashouts
     *
     * @param      {default}  body     // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_cashouts_get_all: async function (req) {
      const start = req.body.start || 0;
      const apiKey = req.session.apiKey;

      //need to check with apiKey because id is in param
      const query = ` SELECT ${CASHOUTS}.*, ${CASHOUTS}.id as cashout_id FROM ${CASHOUTS}
							LEFT JOIN ${USERS} as tab1 ON ${CASHOUTS}.users_id = tab1.id
							WHERE tab1.apiKey = ?
			  				ORDER BY ${CASHOUTS}.updated_at DESC
							LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}
			  				`;

      return this.db.customSQL(query, [apiKey, apiKey]);
    },

    /**
     * (internal) Check if withdrawal is assigned
     *
     * @param      {default}  body     users_id, withdrawal_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result object
     */
    a_cashouts_is_assigned: async function (req) {
      const { users_id, cashouts_id } = req.body;
      const apiKey = req.session.apiKey;

      const query = ` SELECT * FROM ${CASHOUTS}
							RIGHT JOIN ${USERS} as tab1 ON ${CASHOUTS}.users_id = tab1.id
			  				WHERE tab1.apiKey = ?
							AND ${CASHOUTS}.users_id = ${mysql.escape(users_id)}
							AND ${CASHOUTS}.id = ${mysql.escape(cashouts_id)}
			 `;

      const first = true;
      return this.db.customSQL(query, [apiKey, apiKey], [], first);
    },

    /**
     * Set a withdrawal as sendback
     *
     * @param      {default}  body   cashouts_id
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_cashouts_sendback: async function (req) {
      const { cashouts_id } = req.body;
      const apiKey = req.session.apiKey;

      /* get current user id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      /* check if cashout is assigned **/
      const cashouts = await this.private.a_cashouts_is_assigned({
        ...req,
        body: { users_id, cashouts_id },
      });
      if (!cashouts) {
        return { error: "Not assigned to user" };
      }

      /* write sendback state in cashout */

      const bodyParamsNew = {
        sendback: {
          toSqlString: function () {
            return "NOW()";
          },
        },
      };

      //TODO handle if user balance would follow to dust amount, after send_back, very unlikely though

      const internalReq = {
        params: { id: cashouts_id, apiKey },
        body: bodyParamsNew,
      };
      const permissionRequired = false;
      return this.db.postHandler(CASHOUTS, internalReq, permissionRequired);
    },

    /**
     * Send Cashout Sendback Funds
     *
     * @param      {default}  body     cashouts_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default} true
     */
    a_cashouts_sendback_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_cashouts_sendback_send_worker",
        req: { body, session },
      });

      return true;
    },

    a_cashouts_sendback_send_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { cashouts_id } = req.body;
        const apiKey = req.session.apiKey;

        /* get current users_id via apiKey **/
        const users_id = await getUsersIdFromApiKey(apiKey);

        /* get current user */
        const permissionRequired = true;
        const idFromUser = true;
        let user = await db.getHandler(
          USERSDATA,
          { params: { idType: USERS, id: users_id, apiKey } },
          permissionRequired,
          idFromUser
        );
        if (user == null || (user && user.length !== 1)) {
          return { error: "Resource can't be loaded." };
        }
        user = user[0];

        /* check if cashout is by user */

        const permissionRequired1 = true;
        let cashout = await db.getHandler(
          CASHOUTS,
          { params: { idType: USERS, id: cashouts_id, apiKey } },
          permissionRequired1
        );

        if (!cashout || (cashout && cashout.length !== 1))
          return { error: "Cashout not accessible." };
        cashout = cashout[0];

        if (cashout.sendback_txhash) {
          return { error: "Cashout sendback already executed." };
        }

        /* get affected public_key */

        const internalReq2 = {
          params: { idType: AFFECTED, id: cashout.affected_id },
        };
        const permissionRequired2 = false;
        const idFromUser2 = true;
        let affectedData = await db.getHandler(
          AFFECTEDDATA,
          internalReq2,
          permissionRequired2,
          idFromUser2
        );
        if (
          !affectedData ||
          affectedData.length !== 1 ||
          affectedData[0].priv_key == null
        ) {
          return { error: "Resource not found." };
        }
        affectedData = affectedData[0];

        if (!affectedData.curr_public_key) {
          return { error: "Resource not properly created." };
        }

        /* send funds on iota network */

        console.log("------BEFORE SEND");

        const { tx, error, remainderAddress } = parseInt(process.env.IOTA_CHRYSALIS) 
        ? await iotaH.iotaSend({
              body: {
                priv_key: user.priv_key,
                address: affectedData.curr_public_key,
                amount: cashout.amount,
              },
            })
          : await iotaH.iotaSend({
              body: {
                priv_key: user.priv_key,
                address: affectedData.curr_public_key,
                amount: cashout.amount,
                source_address: user.curr_public_key,
                source_address_index: user.curr_public_key_index,
                addressIndexIteration: 1,
                nextAddress: true,
              },
            });

        if (!tx || tx.length === 0 || error || tx[0].hash == null) {
          return { error: tx ? tx.error : error || DEFAULT_ERROR };
        }

        console.log("------AFTER SEND");

        /* update user public_key */

        if (!parseInt(process.env.IOTA_CHRYSALIS)) {
          const internalReq3 = {
            params: { idType: USERS, id: cashout.users_id },
            body: {
              curr_public_key: remainderAddress,
              curr_public_key_index: user.curr_public_key_index + 1,
            },
          };
          const permissionRequired3 = false;
          const apiAsId = false;
          const postViaUserId = true;
          const res = await db.postHandler(
            USERSDATA,
            internalReq3,
            permissionRequired3,
            apiAsId,
            postViaUserId
          );
          if (!res || res.error) {
            return { error: res ? res.error : res };
          }
        }

        return { error: 0, txhash: tx[0].hash };
      }

      const { cashouts_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash } = await proc(req);

      /* update cashouts sendback state */

      const internalReq = {
        params: { id: cashouts_id, apiKey },
        body: { sendback_error: error, sendback_txhash: txhash },
      };
      const permissionRequired4 = true;
      await db.postHandler(
        CASHOUTS,
        internalReq,
        permissionRequired4,
        false,
        false,
        " AND sendback_txhash IS NULL "
      );
    },
  },
};
