const mysql = require("mysql");
const utils = require("../utils.js");

const {
  LIMIT,
  DEFAULT_ERROR,
  USERS,
  USERSDATA,
  CASHOUTS,
  WITHDRAWS,
  IOTA_DUST_OUTPUT_ALLOWANCE,
  fiat_to_iota,
  iota_to_fiat,
  getUsersIdFromApiKey,
  checkLimits,
} = require("../common.js");

module.exports = {
  private: {
    /**
     * Create Withdraw
     *
     * @param      {default}  body     users_id, affected_id, landing_address (valid iota address)
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | {withdraws_id}
     */
    a_withdraws_create: async function (req) {
      const { landing_address, fiat_amount, crncy } = req.body;
      const apiKey = req.session.apiKey;

      if (!landing_address) return { error: "Landing address is empty" };
      if (!fiat_amount) return { error: "Amount is zero" };

      if (
        !this.iotaH.iotaValidAddress({ body: { address: landing_address } })
      ) {
        return { error: "Invalid Address" };
      }

      /* convert to iota amount */
      let amount = await fiat_to_iota(crncy, fiat_amount / 100); //because its in hecto fiat format;
      if (amount.error) {
        return { error: amount.error };
      }
      amount = amount.iota;

      const landing_address_balanceobj = await this.iotaH.iotaGetBalance({ body: { curr_public_key: landing_address } });
      if (!landing_address_balanceobj || landing_address_balanceobj.error) {
        return landing_address_balanceobj;
      }

      if (landing_address_balanceobj.balance &&
        amount < IOTA_DUST_OUTPUT_ALLOWANCE
        && (!landing_address_balanceobj.balance || !landing_address_balanceobj.balance.dust_allowed)) {
         return {
          error:
            "Withdrawal only possible for balances higher than 1 MIOTA.",
        };   
      }

      /* get current users_id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);

      /* get current user */
      const permissionRequired = true;
      const idFromUser = true;
      let user = await this.db.getHandler(
        USERSDATA,
        { params: { idType: USERS, id: users_id, apiKey } },
        permissionRequired,
        idFromUser
      );
      if (user == null || (user && user.length !== 1)) {
        return { error: "Resource can't be loaded." };
      }
      user = user[0];

      if (
        user.curr_public_key ===
        this.iotaH.iotaCreateChecksum({ body: { address: landing_address } })
      ) {
        return { error: "Can't withdraw to your own address." };
      }

      /* get user balance */
      const userBalanceObj = await this.iotaH.iotaGetBalance({
        body: { curr_public_key: user.curr_public_key },
      });

      if (!userBalanceObj || !userBalanceObj.balance || userBalanceObj.error)
        return { error: "Balance could not be found" };

      if (userBalanceObj.balance && userBalanceObj.balance.balance < amount) {
        return { error: "Insufficient balance. Retry in a minute." };
      }

      let fiat_amount_post = fiat_amount;
      
      /* dust may not remain on sender address */
      
      if((userBalanceObj.balance.balance - amount) < IOTA_DUST_OUTPUT_ALLOWANCE){
        amount = userBalanceObj.balance.balance;

        /* convert to new fiat amount */
        fiat_amount_post = await iota_to_fiat(crncy, amount);
        if (fiat_amount_post.error) {
          return { error: fiat_amount_post.error };
        }
        fiat_amount_post = fiat_amount_post[crncy] * 100; //because hecto fiat.
      }

      /* get user limit */
      const limitsResult = await checkLimits(WITHDRAWS, null, apiKey);
      if (limitsResult.error) {
        return { error: limitsResult.error };
      }

      if (!user.curr_public_key) {
        return { error: "Resource not properly created." };
      }

      /* write withdraw */
      const id = utils.uuidv4();
      const bodyParamsNew = { id, users_id, amount, fiat_amount: fiat_amount_post, crncy, landing_address };
      const internalReq4 = { params: { apiKey }, body: bodyParamsNew };
      const permissionRequired4 = false;
      const put = await this.db.putHandler(
        WITHDRAWS,
        internalReq4,
        permissionRequired4
      );
      if (!put || put.error || put.insertId == null) {
        return put;
      }

      const withdraws_id = id;
      return { withdraws_id };
    },

    /**
     * Send Withdraw Funds
     *
     * @param      {default}  body     withdraws_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default} true
     */
    a_withdraws_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_withdraws_send_worker",
        req: { body, session },
      });

      return true;
    },

    a_withdraws_send_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { withdraws_id } = req.body;
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

        /* check if withdraw is by user */
        const permissionRequired1 = true;
        let withdraw = await db.getHandler(
          WITHDRAWS,
          { params: { idType: USERS, id: withdraws_id, apiKey } },
          permissionRequired1
        );

        if (withdraw == null || (withdraw && withdraw.length !== 1))
          return { error: "Withdrawal not accessible." };
        withdraw = withdraw[0];

        if (withdraw.txhash) {
          return { error: "Withdraw already executed." };
        }

        if (!user.curr_public_key) {
          return { error: "Resource not properly created." };
        }

        /* send funds on iota network */

        console.log("------BEFORE SEND");

        const { tx, remainderAddress, error } = parseInt(
          process.env.IOTA_CHRYSALIS
        )
          ? await iotaH.iotaSend({
              body: {
                priv_key: user.priv_key,
                address: withdraw.landing_address,
                amount: withdraw.amount,
              },
            })
          : await iotaH.iotaSend({
              body: {
                priv_key: user.priv_key,
                address: withdraw.landing_address,
                amount: withdraw.amount,
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

        if (!parseInt(process.env.IOTA_CHRYSALIS)) {
          /* update users public_key */

          const internalReq3 = {
            params: { idType: USERS, id: withdraw.users_id },
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

      const { withdraws_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash } = await proc(req);

      /* update withdraws */

      const internalReq = {
        params: { id: withdraws_id, apiKey },
        body: { error, txhash },
      };
      const permissionRequired4 = true;
      await db.postHandler(
        WITHDRAWS,
        internalReq,
        permissionRequired4,
        false,
        false,
        " AND txhash IS NULL "
      );
    },

    /**
     * Get (single) Withdraw
     *
     * @param      {default}  body     withdraws_id
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result object
     */
    a_withdraws_get: async function (req) {
      const { withdraws_id } = req.body;
      const apiKey = req.session.apiKey;

      const internalReq = {
        params: { idType: USERS, id: withdraws_id, apiKey: apiKey },
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
     * Get All Currently Associated Withdraws
     *
     * @param      {default}  body     // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_withdraws_get_all: async function (req) {
      const start = req.body.start || 0;
      const apiKey = req.session.apiKey;

      //need to check with apiKey because id is in param
      const query = ` SELECT ${WITHDRAWS}.*, ${WITHDRAWS}.id as withdraw_id FROM ${WITHDRAWS}
							LEFT JOIN ${USERS} as tab1 ON ${WITHDRAWS}.users_id = tab1.id
							WHERE tab1.apiKey = ?
			  				ORDER BY ${WITHDRAWS}.updated_at DESC
							LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}
			  				`;

      return this.db.customSQL(query, [apiKey, apiKey]);
    },
  },
};
