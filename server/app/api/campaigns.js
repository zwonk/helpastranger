const mysql = require("mysql");
const utils = require("../utils.js");

const {
  LIMIT,
  DEFAULT_ERROR,
  USERS,
  AFFECTED,
  USERSDATA,
  AFFECTEDDATA,
  CAMPAIGNS,
  getUsersIdFromApiKey,
  checkLimits,
} = require("../common.js");

/*
NOTE: CURRENTLY UNUSED
**/

module.exports = {
  private: {
    /**
     * Delete a Campaign and current amount goes back to affected
     *
     * @param      {default}  body     campaigns_id
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_campaigns_delete: async function (req) {
      const { campaigns_id } = req.body;
      const apiKey = req.session.apiKey;

      let res = await this.private.a_campwithdrawals_create({
        ...req,
        body: { campaigns_id, landing_address: null, delete_flag: true },
      });

      if (!res || res.error) {
        return {
          error: res ? res.error : "Cold not create campaign withdrawal",
        };
      }

      this.private.a_campwithdrawals_send_worker({
        ...req,
        body: { campwithdrawals_id: res.campwithdrawals_id },
      });

      const internalReq = {
        params: { id: campaigns_id, apiKey },
        body: { deleted: 1 },
      };
      return this.db.postHandler(CAMPAIGNS, internalReq);
    },

    /**
     * Change campaign details
     *
     * @param      {default}  body     title, fiat_amount // description, img_link
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_campaigns_change: async function (req) {
      const {
        campaigns_id,
        title,
        description,
        img_link,
        fiat_amount,
      } = req.body;
      const apiKey = req.session.apiKey;

      if (!title) {
        return { error: "Title may not be empty" };
      }

      if (fiat_amount) {
        return { error: "Donation amount can't be changed." };
      }

      /* get current user id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

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

      /* check if campaign is by user */

      const permissionRequired1 = true;
      let campaign = await this.db.getHandler(
        CAMPAIGNS,
        { params: { idType: USERS, id: campaigns_id, apiKey } },
        permissionRequired1
      );
      if (campaign == null || (campaign && campaign.length !== 1))
        return { error: "Campaign not accessible." };
      campaign = campaign[0];

      const bodyParamsNew = { title, description, img_link };
      const internalReq = {
        params: { idType: USERS, id: campaigns_id, apiKey: apiKey },
        body: bodyParamsNew,
      };
      const permissionRequired2 = true;
      return this.db.postHandler(CAMPAIGNS, internalReq, permissionRequired2);
    },

    /**
     * Get Currently Associated Campaigns for user with donation stats
     *
     * @param      {default}  body     // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_campaigns_get_all_associated_with_stats: async function (req) {
      const start = req.body.start || 0;
      const apiKey = req.session.apiKey;

      //need to check with apiKey because id is in param
      const query = ` SELECT ${CAMPAIGNS}.*, ${CAMPAIGNS}.id as campaigns_id, fiat_amount_sum, donations_count FROM ${CAMPAIGNS}
							LEFT JOIN ${USERS} as tab1 ON ${CAMPAIGNS}.users_id = tab1.id
							LEFT JOIN (SELECT campaigns_id, SUM(fiat_amount) as fiat_amount_sum, COUNT(id) as donations_count FROM donations WHERE txhash IS NOT NULL GROUP BY campaigns_id ) as tab1 ON tab1.campaigns_id = ${CAMPAIGNS}.id
							WHERE tab1.apiKey = ? and ${CAMPAIGNS}.deleted is NULL
			  				ORDER BY ${CAMPAIGNS}.created_at DESC
							LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}
			  				`;

      return this.db.customSQL(query, [apiKey, apiKey]);
    },

    /**
     * Get campaign
     *
     * @param      {default}  body     { campaigns_id }
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result object
     */
    a_campaigns_get: async function (req) {
      const { body, session } = req;

      const internalReq = {
        params: {
          idType: USERS,
          id: body.campaigns_id,
          apiKey: session.apiKey,
        },
      };

      const permissionRequired = false;
      const res = await this.db.getHandler(
        CAMPAIGNS,
        internalReq,
        permissionRequired
      );

      return res;
    },

    /**
     * Create a campaign
     *
     * @param      {default}  body    affected_id, title, fiat_amount, img_link // description
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | {campaigns_id}
     */
    a_campaigns_create: async function (req) {
      const {
        affected_id,
        title,
        fiat_amount,
        img_link,
        description,
      } = req.body;
      const apiKey = req.session.apiKey;

      if (affected_id == null) {
        return { error: "Affected Id is empty" };
      }

      /* check if user has rights to create campaign */
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
        return { error: "Not allowed to create campaign" };
      }

      const { users_id } = canWithdraw;

      /* get user limit */
      const limitsResult = await checkLimits(CAMPAIGNS, null, apiKey);
      if (limitsResult.error) {
        return { error: limitsResult.error };
      }

      /* check for existent campaign */
      const internalReq1 = { params: { idType: AFFECTED, id: affected_id } };
      const permissionRequired = false;
      const idFromUser = true;
      const injectSQL = " AND finished is not NULL ";

      const campaign = await this.db.getHandler(
        CAMPAIGNS,
        internalReq1,
        permissionRequired,
        idFromUser,
        injectSQL
      );

      if (campaign && campaign.length > 0) {
        return { error: "Campaign already exists" };
      }

      /* get affected priv_key **/
      const internalReq2 = { params: { idType: AFFECTED, id: affected_id } };
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

      if (!affectedData.curr_public_key) {
        return { error: "Resource not properly created." };
      }

      /* write campaign */
      const id = utils.uuidv4();

      const bodyParamsNew = {
        id,
        users_id,
        affected_id,
        title,
        fiat_amount,
        img_link,
        description,
      };
      const internalReq4 = { params: { apiKey }, body: bodyParamsNew };
      const permissionRequired4 = false;
      const put = await this.db.putHandler(
        CAMPAIGNS,
        internalReq4,
        permissionRequired4
      );
      if (!put || put.error || put.insertId == null) {
        return put;
      }

      const campaigns_id = id;
      return { campaigns_id };
    },

    /**
     * Transfer Funds internally for affected to open up and address for the campaign
     *
     * @param      {default}  body     campaigns_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default} true
     */
    a_campaigns_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_campaigns_send_worker",
        req: { body, session },
      });

      return true;
    },

    a_campaigns_send_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { campaigns_id } = req.body;
        const apiKey = req.session.apiKey;

        /* get current user id via apiKey **/
        const users_id = await getUsersIdFromApiKey(apiKey);
        if (!users_id) {
          return { error: "User not found" };
        }

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

        /* check if campaign is by user */

        const permissionRequired1 = true;
        let campaign = await db.getHandler(
          CAMPAIGNS,
          { params: { idType: USERS, id: campaigns_id, apiKey } },
          permissionRequired1
        );
        if (campaign == null || (campaign && campaign.length !== 1))
          return { error: "Campaign not accessible." };
        campaign = campaign[0];

        if (campaign.txhash) {
          return { error: "Campaign payment already executed." };
        }

        /* get affected priv_key */

        const internalReq2 = {
          params: { idType: AFFECTED, id: campaign.affected_id },
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

        /* transfer funds between two affected address to open up campaign address */

        console.log("------BEFORE SEND");

        const { tx, error } = await iotaH.iotaSend({
          body: {
            priv_key,
            address: null,
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
        };
      }

      const { campaigns_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash } = await proc(req);

      /* update camapaign */

      const internalReq = {
        params: { id: campaigns_id, apiKey },
        body: {
          error_bridge: error,
          txhash_bridge: txhash,
        },
      };
      const permissionRequired4 = true;
      const post = await db.postHandler(
        CAMPAIGNS,
        internalReq,
        permissionRequired4,
        false,
        false,
        " AND txhash_bridge IS NULL "
      );
      if (!post || post.error) {
        return { error: post ? post.error : DEFAULT_ERROR };
      }

      return true;
    },
  },
};
