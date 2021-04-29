const utils = require("../utils.js");

const {
  DEFAULT_ERROR,
  CRNCY,
  USERS,
  AFFECTED,
  USERSDATA,
  AFFECTEDDATA,
  CAMPAIGNS,
  CAMPAIGNS_WITHDRAWALS,
  getUsersIdFromApiKey,
  getAffectedPublicKey,
  iota_to_fiat,
} = require("../common.js");

/*
NOTE: CURRENTLY UNUSED
**/

module.exports = {
  private: {
    /**
     * Create a campaign withdrawal
     *
     * @param      {default}  body    campaigns_id, landing_address // delete_flag (bool)
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | {campwithdrawals_id}
     */
    a_campwithdrawals_create: async function (req) {
      const { campaigns_id, landing_address, delete_flag } = req.body;
      const apiKey = req.session.apiKey;

      if (campaigns_id == null) {
        return { error: "Campaigns Id is empty" };
      }

      /* get current user id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      /* check if user has rights to withdraw campaign */
      const query1 = `SELECT users_id FROM ${USERS}
							RIGHT JOIN ${USERSDATA} ON ${USERSDATA}.users_id = ${USERS}.id
							WHERE ${USERS}.apiKey = ?
							AND ${USERSDATA}.member_state > 0
							AND ${USERSDATA}.flagged IS NULL
							`;

      const first = true;
      const canWithdraw = await this.db.customSQL(
        query1,
        [req.session.apiKey],
        [],
        first
      );
      if (!canWithdraw) {
        return { error: "Not allowed to withdraw campaign" };
      }

      /* no user limit. person can always withdraw his own campaign .*/

      /* check for existent withdrawal, check if campaign is owned by used  */
      const internalReq1 = {
        params: { idType: USERS, id: campaigns_id, apiKey },
      };
      const permissionRequired = true;
      const idFromUser = false;
      const injectSQL = ` AND finished IS NULL `;
      let campaign = await this.db.getHandler(
        CAMPAIGNS,
        internalReq1,
        permissionRequired,
        idFromUser,
        injectSQL
      );
      if (!campaign || campaign.length === 0) {
        return { error: "No current campaign from user found." };
      }
      campaign = campaign[0];

      let address = null;

      if (!delete_flag) {
        address = landing_address;

        if (
          !this.iotaH.iotaValidAddress({ body: { address: landing_address } })
        ) {
          return { error: "Invalid Address" };
        }

        /* check campaign balance */
        const balanceObj = await this.iotaH.iotaGetBalance({
          body: { curr_public_key: campaign.campaign_address },
        });
        if (!balanceObj || !balanceObj.balance ||balanceObj.error) {
          return { error: "Balance could not be found" };
        }
        const fiat_balance = await iota_to_fiat(CRNCY, balanceObj.balance.balance);
        if (!fiat_balance || fiat_balance.error) {
          return { error: "Balance could not be fetched try again later." };
        }
        if (fiat_balance[CRNCY] < campaign.fiat_amount / 100) {
          return { error: "Balance can only be withdrawn at full amount" };
        }
      } else {
        const affected_public_key = await getAffectedPublicKey({
          affected_id: campaign.affected_id,
        });
        if (!affected_public_key || affected_public_key.error) {
          return { error: "Resource not properly created" };
        }

        address = affected_public_key;
      }

      /* get affected priv_key **/
      const internalReq2 = {
        params: { idType: AFFECTED, id: campaign.affected_id },
      };
      const permissionRequired2 = false;
      const idFromUser2 = true;
      let affectedData = await this.db.getHandler(
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

      /* write campaign withdrawal */
      const id = utils.uuidv4();
      const bodyParamsNew = {
        id,
        users_id,
        campaigns_id,
        landing_address: address,
      };
      const internalReq4 = { params: { apiKey }, body: bodyParamsNew };
      const permissionRequired4 = false;
      const put = await this.db.putHandler(
        CAMPAIGNS_WITHDRAWALS,
        internalReq4,
        permissionRequired4
      );
      if (!put || put.error || put.insertId  == null) {
        return put;
      }

      const campwithdrawals_id = id;
      return { campwithdrawals_id };
    },

    /**
     * Transfer Funds externally to campaign holder
     *
     * @param      {default}  body     campwithdrawal_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default} true
     */
    a_campwithdrawals_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_campwithdrawals_send_worker",
        req: { body, session },
      });

      return true;
    },

    a_campwithdrawals_send_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { campwithdrawals_id } = req.body;
        const apiKey = req.session.apiKey;

        /* get current user id via apiKey */

        const users_id = await getUsersIdFromApiKey(apiKey);
        if (!users_id) {
          return { error: "User not found" };
        }

        /* check if campaign_withdrawal is by user */

        const permissionRequired1 = true;
        let campwithdrawal = await db.getHandler(
          CAMPAIGNS_WITHDRAWALS,
          { params: { idType: USERS, id: campwithdrawals_id, apiKey } },
          permissionRequired1
        );
        if (
          campwithdrawal == null ||
          (campwithdrawal && campwithdrawal.length !== 1)
        )
          return { error: "Campaign Withdrawal not accessible." };
        campwithdrawal = campwithdrawal[0];

        if (campwithdrawal.txhash) {
          return { error: "Campaign withdrawal already executed." };
        }

        /* get campaigns */

        const permissionRequired2 = true;
        let campaign = await db.getHandler(
          CAMPAIGNS,
          {
            params: { idType: USERS, id: campwithdrawal.campaigns_id, apiKey },
          },
          permissionRequired2
        );
        if (campaign == null || (campaign && campaign.length !== 1))
          return { error: "Campaign not accessible." };
        campaign = campaign[0];

        /* get affected priv_key */

        const internalReq3 = {
          params: { idType: AFFECTED, id: campaign.affected_id },
        };
        const permissionRequired3 = false;
        const idFromUser3 = true;
        let affectedData = await db.getHandler(
          AFFECTEDDATA,
          internalReq3,
          permissionRequired3,
          idFromUser3
        );
        if (
          !affectedData ||
          affectedData.length !== 1 ||
          affectedData[0].priv_key == null
        ) {
          return { error: "Resource not found." };
        }
        affectedData = affectedData[0];
        const priv_key = affectedData.priv_key;

        /* send funds on iota network */

        console.log("------BEFORE SEND");

        const { tx, error } = await iotaH.iotaSend({
          body: {
            priv_key,
            address: campwithdrawal.landing_address,
            amount: null,
          },
        });

        if (!tx || tx.length === 0 || error || tx[0].hash == null) {
          return { error: tx ? tx.error : error || DEFAULT_ERROR };
        }

        console.log("------AFTER SEND");

        return {
          error: 0,
          txhash: tx[0].hash,
          campaigns_id: campwithdrawal.campaigns_id,
        };
      }

      const { campwithdrawals_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash, campaigns_id } = await proc(req);

      /* update campaign withdrawal */

      const internalReq = {
        params: { id: campwithdrawals_id, apiKey },
        body: { error, txhash },
      };
      const permissionRequired4 = true;
      const post = await db.postHandler(
        CAMPAIGNS_WITHDRAWALS,
        internalReq,
        permissionRequired4,
        false,
        false,
        " AND txhash IS NULL "
      );

      /* update campaign  */

      if (post && txhash) {
        const internalReq = {
          params: { id: campaigns_id, apiKey },
          body: {
            txhash,
            finished: {
              toSqlString: function () {
                return "NOW()";
              },
            },
          },
        };
        const permissionRequired5 = true;
        await db.postHandler(
          CAMPAIGNS,
          internalReq,
          permissionRequired5,
          false,
          false,
          " AND txhash IS NULL "
        );
      }

      return true;
    },

    /**
     * Transfer Funds internally back to affected
     *
     * @param      {default}  body     campwithdrawal_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default} true
     */
    a_campwithdrawals_send_back: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_campwithdrawals_send_back_worker",
        req: { body, session },
      });

      return true;
    },

    a_campwithdrawals_send_back_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { campwithdrawals_id } = req.body;
        const apiKey = req.session.apiKey;

        /* get current user id via apiKey */

        const users_id = await getUsersIdFromApiKey(apiKey);
        if (!users_id) {
          return { error: "User not found" };
        }

        /* check if campaign_withdrawal is by user */

        const permissionRequired1 = true;
        let campwithdrawal = await db.getHandler(
          CAMPAIGNS_WITHDRAWALS,
          { params: { idType: USERS, id: campwithdrawals_id, apiKey } },
          permissionRequired1
        );
        if (
          campwithdrawal == null ||
          (campwithdrawal && campwithdrawal.length !== 1)
        )
          return { error: "Campaign Withdrawal not accessible." };
        campwithdrawal = campwithdrawal[0];

        /* get campaigns */

        const permissionRequired2 = true;
        let campaign = await db.getHandler(
          CAMPAIGNS,
          {
            params: { idType: USERS, id: campwithdrawal.campaigns_id, apiKey },
          },
          permissionRequired2
        );
        if (campaign == null || (campaign && campaign.length !== 1))
          return { error: "Campaign not accessible." };
        campaign = campaign[0];

        /* get affected priv_key */

        const internalReq3 = {
          params: { idType: AFFECTED, id: campaign.affected_id },
        };
        const permissionRequired3 = false;
        const idFromUser3 = true;
        let affectedData = await db.getHandler(
          AFFECTEDDATA,
          internalReq3,
          permissionRequired3,
          idFromUser3
        );
        if (
          !affectedData ||
          affectedData.length !== 1 ||
          affectedData[0].priv_key == null
        ) {
          return { error: "Resource not found." };
        }
        affectedData = affectedData[0];
        const priv_key = affectedData.priv_key;

        /* send funds on iota network */

        console.log("------BEFORE SEND");

        const { tx, error } = await iotaH.iotaSend({
          body: {
            priv_key,
            address: affectedData.curr_public_key,
            amount: null,
          },
        });

        if (!tx || tx.length === 0 || error || tx[0].hash == null) {
          return { error: tx ? tx.error : error || DEFAULT_ERROR };
        }

        console.log("------AFTER SEND");

        return {
          error: 0,
          txhash: tx[0].hash,
          campaigns_id: campwithdrawal.campaigns_id,
        };
      }

      const { campwithdrawals_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash, campaigns_id } = await proc(req);

      /* update campaign withdrawal */

      const internalReq = {
        params: { id: campwithdrawals_id, apiKey },
        body: { error, txhash },
      };
      const permissionRequired4 = true;
      const post = await db.postHandler(
        CAMPAIGNS_WITHDRAWALS,
        internalReq,
        permissionRequired4,
        false,
        false,
        " AND txhash_bridge IS NULL "
      );

      /* update campaign  */

      if (post && txhash) {
        const internalReq = {
          params: { id: campaigns_id, apiKey },
          body: {
            txhash,
            finished: {
              toSqlString: function () {
                return "NOW()";
              },
            },
          },
        };
        const permissionRequired5 = true;
        await db.postHandler(
          CAMPAIGNS,
          internalReq,
          permissionRequired5,
          false,
          false,
          " AND txhash_bridge IS NULL "
        );
      }

      return true;
    },

    /**
     * Get campaign
     *
     * @param      {default}  body     { campwithdrawal_id }
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result object
     */
    a_campwithdrawals_get: async function (req) {
      const { body, session } = req;

      const internalReq = {
        params: {
          idType: USERS,
          id: body.campwithdrawals_id,
          apiKey: session.apiKey,
        },
      };

      const res = await this.db.getHandler(CAMPAIGNS_WITHDRAWALS, internalReq);

      return res;
    },
  },
};
