const mysql = require("mysql");
const utils = require("../utils.js");

const {
  HELPA_DONATION_AMOUNT,
  HELPA_DONATION_ACCOUNT,
  HELPA_DONATION_ON,
  IOTA_DUST_OUTPUT_ALLOWANCE,
  API_KEY_DURATION,
  LIMIT,
  DEFAULT_ERROR,
  USERS,
  AFFECTED,
  USERSDATA,
  SAVED,
  DONATIONS,
  createDonationForAffected,
  createDonationForCampaign,
  resetSaved,
  fiat_to_iota,
  iota_to_fiat,
  getUsersIdFromApiKey,
  checkLimits,
  getAffectedBalance,
} = require("../common.js");

module.exports = {
  public: {
    /**
		 * (Public) Create a donation
		 *
		 * @param       {default}  body   affected_id // campaigns_id
		 *
		 * @returns     {default}  error | {donations_id, txamount, txfiatamount, secret}

		 */
    donations_create: async function (req) {
      const { affected_id, crncy, campaigns_id, secret } = req.body;

      if (!HELPA_DONATION_ON) {
        return {
          error:
            "Public donations temporarly disabled. Please create an account.",
        };
      }

      if (!affected_id) {
        return { error: "No resource selected. Please try again." };
      }

      /* get user limit */
      const limitsResult = await checkLimits(DONATIONS, null, null);
      if (limitsResult.error) {
        return { error: limitsResult.error };
      }

      let iota_amount = HELPA_DONATION_AMOUNT;
      let fiat_amount;
      const users_id = null;

      const affectedBalance = await getAffectedBalance( { body: { id: affected_id } } )

      // send zero-tx if dust not allowed
      if (iota_amount < IOTA_DUST_OUTPUT_ALLOWANCE
        && (!affectedBalance || !affectedBalance.dustAllowed)) {

          fiat_amount = 0;
          iota_amount = 0;

      } else {

        fiat_amount = await iota_to_fiat(crncy, iota_amount);
        if (fiat_amount == null || fiat_amount.error) {
          return fiat_amount;
        }
        fiat_amount = fiat_amount[crncy] * 100; //because its in hecto fiat format

    }

        //TODO platform fund check and remaining dust check

      const secretPost = secret;

      const id = utils.uuidv4();

      /* donation */
      const internalReq = {
        params: {},
        body: {
          id,
          users_id,
          affected_id,
          campaigns_id,
          amount: iota_amount,
          fiat_amount,
          crncy,
          txhash: null,
          secret: secretPost,
          donation_free: 1,
        },
      };
      const permissionRequired3 = false;
      const put = await this.db.putHandler(
        DONATIONS,
        internalReq,
        permissionRequired3
      );
      if (!put || put.error || put.insertId == null) {
        return put;
      }

      const donations_id = id;

      if (secret) {
        await resetSaved(secret, donations_id);
      }

      return {
        donations_id,
        txamount: Math.trunc(iota_amount),
        txfiatamount: Math.trunc(fiat_amount),
        txcrncy: crncy,
      };
    },

    donations_send_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { secret } = req.body;

        const priv_key = HELPA_DONATION_ACCOUNT; //TODE get userdata by id instead of priv_key

        if (!HELPA_DONATION_ON) {
          return {
            error:
              "Public donations temporarly disabled. Please create an account.",
          };
        }

        // get platform user
        let user = await db.simpleGetHandler(USERSDATA, { body: { priv_key } });
        if (user == null || (user && user.length !== 1))
          return { error: "Platform error" };
        user = user[0];

        /* find transaction matching secret */

        let donation = await db.simpleGetHandler(DONATIONS, {
          body: { secret },
        }); //TODO fully prevent secret collection & reuse, partially prevented through limits

        if (donation == null || (donation && donation.length !== 1))
          return { error: "Donation not accessible." };

        donation = donation[0];

        const userData = {
          users_id: user.users_id,
          curr_public_key: user.curr_public_key,
          curr_public_key_index: user.curr_public_key_index,
        };

        /* send funds */
        let txhash = null;
        if (!donation.campaigns_id) {
          const { tx, error } = await createDonationForAffected(
            donation.affected_id,
            donation.amount,
            priv_key,
            userData
          );
          if (error || !tx) {
            return { error: error || DEFAULT_ERROR };
          }
          txhash = tx[0].hash;
        } else {
          const { tx, error } = await createDonationForCampaign(
            donation.campaigns_id,
            donation.amount,
            priv_key,
            userData
          );
          if (error || !tx) {
            return { error: error || DEFAULT_ERROR };
          }
          txhash = tx[0].hash;
        }

        return { error: 0, txhash: txhash };
      }

      const { secret } = req.body;

      const { error, txhash } = await proc(req);

      const query = `	UPDATE ${DONATIONS}
				   			SET error = ?, txhash = ?
							WHERE secret = ${mysql.escape(secret)}
							AND txhash IS NULL`;

      return db.customSQL(query, [error, txhash]);
    },

    /**
		 * (Public) Send funds for a donation
		 *
		 * @param       {default}  body   secret
		 *
		 * @returns     {default}  true

		 */
    donations_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "public",
        fn: "donations_send_worker",
        req: { body, session },
      });

      return true;
    },

    /**
		 * (Public) Get donation
		 *
		 * @param       {default}  body   secret
		 *
		 * @returns     {default}  error | result object

		 */
    donations_get: async function (req) {
      const { body } = req;

      const internalReq = { body: { secret: body.secret } };
      const res = await this.db.simpleGetHandler(DONATIONS, internalReq);

      return res;
    },
  },

  private: {
    //only for debug
    a_get_all_addresses: async function (req) {
      return false;

      /*const apiKey = req.session.apiKey;

        const users_id = await getUsersIdFromApiKey(apiKey);
        if (!users_id) {
          return { error: "User not found" };
        }

        // get current user 
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

        let priv_key = user.priv_key;
        return getAllAddresses(priv_key);
        */
    },

    /**
     * Create donation
     *
     * @param      {default}  body     affected_id, amount (100 * USD,  > 0) //
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error |  {donations_id, txamount, txfiatamount}
     */
    a_donations_create: async function (req) {
      const { affected_id, campaigns_id, amount, crncy, secret } = req.body;
      const apiKey = req.session.apiKey;

      const org_amount = amount;

      let fiat_amount = amount;

      let iota_amount;

      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      /* donation on user */

      if (fiat_amount) {
        /* convert fiat to iota **/
        iota_amount = await fiat_to_iota(crncy, fiat_amount);
        if (iota_amount == null || iota_amount.error) {
          return iota_amount;
        }

        iota_amount = iota_amount.iota / 100; //because its in hecto fiat format

        const affectedBalance = await getAffectedBalance( { body: { id: affected_id } } )
        
        if (iota_amount < IOTA_DUST_OUTPUT_ALLOWANCE
          && (!affectedBalance || !affectedBalance.dustAllowed)) {

          if(affectedBalance.balance === 0){
            return {
              error:
              "Donation needs to be > 1 MIOTA. Please choose a higher amount or switch currency.",
            }; 
          } else {
           return {
            error:
              "Donation needs to be > 1 MIOTA. Please choose higher amount or switch currency.",
          };
        }
        }

      } else {

        //TODO platform fund check and remaining dust check

        /* donation on us */

        if (!HELPA_DONATION_ON) {
          return {
            error:
              "Free donations temporarly disabled.",
          };
        }

        /* get public limit */
        const limitsResult = await checkLimits(DONATIONS, null, null);
        if (limitsResult.error) {
          return { error: limitsResult.error };
        }

        iota_amount = HELPA_DONATION_AMOUNT;

        const affectedBalance = await getAffectedBalance( { body: { id: affected_id } } )

        // send zero-tx if dust not allowed
        if (iota_amount < IOTA_DUST_OUTPUT_ALLOWANCE
          && (!affectedBalance || !affectedBalance.dustAllowed)) {

            fiat_amount = 0;
            iota_amount = 0;

        } else {

          fiat_amount = await iota_to_fiat(crncy, iota_amount);
          if (fiat_amount == null || fiat_amount.error) {
            return fiat_amount;
          }

          fiat_amount = fiat_amount[crncy] * 100; //because its in hecto fiat format
        }
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

      let fiat_amount_post = fiat_amount;
      
      console.log("1------------")

      if (org_amount) {

        /* check user balance */

        const balanceObj = await this.iotaH.iotaGetBalance({
          body: { curr_public_key: user.curr_public_key },
        });

        if (!balanceObj || !balanceObj.balance || balanceObj.error || 
          balanceObj.balance.balance < iota_amount) {
          return { error: "Insufficient balance. Retry in a minute." };
        }

        /* dust may not remain on sender address */

        console.log("2------------")
        console.log(balanceObj)

        if((balanceObj.balance.balance - iota_amount) < IOTA_DUST_OUTPUT_ALLOWANCE){
          iota_amount = balanceObj.balance.balance;

          /* convert to new fiat amount */
          fiat_amount_post = await iota_to_fiat(crncy, iota_amount);
          if (fiat_amount_post.error) {
            return { error: fiat_amount_post.error };
          }
          fiat_amount_post = fiat_amount_post[crncy] * 100; //because hecto fiat.
        }

      }

      /* TODO check platform balance */

      const id = utils.uuidv4();

      const secretPost = secret; // no need of generated secret if users_id is known

      const internalReq = {
        params: { apiKey },
        body: {
          id,
          users_id,
          affected_id,
          campaigns_id,
          amount: iota_amount,
          fiat_amount: fiat_amount_post,
          crncy,
          txhash: null,
          secret: secretPost,
          donation_free: amount ? null : 1,
        },
      };
      const permissionRequired3 = false;
      const put = await this.db.putHandler(
        DONATIONS,
        internalReq,
        permissionRequired3
      );
      if (!put || put.error || put.insertId == null) {
        return put;
      }

      const donations_id = id;

      if (secret) {
        await resetSaved(secret, donations_id);
      }

      return {
        donations_id,
        txamount: Math.trunc(iota_amount),
        txfiatamount: Math.trunc(fiat_amount_post),
        txcrncy: crncy,
      };
    },

    a_donations_send_worker: async function (req, db, iotaH) {
      async function proc(req) {
        const { donations_id } = req.body;
        const apiKey = req.session.apiKey;

        const users_id = await getUsersIdFromApiKey(apiKey);
        if (!users_id) {
          return { error: "User not found" };
        }

        /* get current user **/
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

        let priv_key = user.priv_key;
        let curr_public_key = user.curr_public_key;
        let curr_public_key_index = user.curr_public_key_index;
        let tx_users_id = user.users_id;

        /* check if donation is by user */
        const permissionRequired2 = true;
        let donation = await db.getHandler(
          DONATIONS,
          { params: { idType: USERS, id: donations_id, apiKey } },
          permissionRequired2
        );

        if (donation == null || (donation && donation.length !== 1))
          return { error: "Donation not accessible." };
        donation = donation[0];

        if (donation.txhash) {
          return { error: "Donation already executed." };
        }

        // if donation free
        if (donation.donation_free) {
          if (!HELPA_DONATION_ON) {
            return {
              error:
                "Public donations temporarly disabled. Please create an account.",
            };
          }

          priv_key = HELPA_DONATION_ACCOUNT;

          // get platform user
          let platform_user = await db.simpleGetHandler(USERSDATA, {
            body: { priv_key: HELPA_DONATION_ACCOUNT },
          });
          if (
            platform_user == null ||
            (platform_user && platform_user.length !== 1)
          )
            return { error: "Platform error" };
          platform_user = platform_user[0];

          curr_public_key = platform_user.curr_public_key;
          curr_public_key_index = platform_user.curr_public_key_index;
          tx_users_id = platform_user.users_id;
        }

        const userData = {
          users_id: tx_users_id,
          curr_public_key,
          curr_public_key_index,
        };

        /* send funds */
        let txhash = null;
        if (!donation.campaigns_id) {
          const { tx, error } = await createDonationForAffected(
            donation.affected_id,
            donation.amount,
            priv_key,
            userData
          );
          if (error || !tx) {
            return { error: error || DEFAULT_ERROR };
          }
          txhash = tx[0].hash;
        } else {
          const { tx, error } = await createDonationForCampaign(
            donation.campaigns_id,
            donation.amount,
            priv_key,
            userData
          );
          if (error || !tx) {
            return { error: error || DEFAULT_ERROR };
          }
          txhash = tx[0].hash;
        }

        return { error: 0, txhash };
      }

      const { donations_id } = req.body;
      const apiKey = req.session.apiKey;

      const { error, txhash } = await proc(req);

      const internalReq = {
        params: { id: donations_id, apiKey },
        body: { error, txhash },
      };
      const permissionRequired3 = true;
      await db.postHandler(
        DONATIONS,
        internalReq,
        permissionRequired3,
        false,
        false,
        " AND txhash IS NULL "
      );
    },

    /**
     * Send donation
     *
     * @param      {default}  body     id
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  true
     */
    a_donations_send: async function (req) {
      const { body, session } = req;
      this.workQueue.add({
        api: "private",
        fn: "a_donations_send_worker",
        req: { body, session },
      });

      return true;
    },

    /**
     * Get donation
     *
     * @param      {default}  body     donations_id
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result object
     */
    a_donations_get: async function (req) {
      const { body, session } = req;

      const internalReq = {
        params: {
          idType: USERS,
          id: body.donations_id,
          apiKey: session.apiKey,
        },
      };

      const res = await this.db.getHandler(DONATIONS, internalReq);

      return res;
    },

    /**
     * Reassign public donation to user
     *
     * @param      {default}  body     secret
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | true
     */
    a_donations_account_assign: async function (req) {
      const { secret } = req.body;
      const apiKey = req.session.apiKey;

      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      /* check if transaction matches secret */

      let donation = await this.db.simpleGetHandler(DONATIONS, {
        body: { secret },
      });
      if (donation == null || (donation && donation.length !== 1))
        return { error: "Donation not accessible." };

      donation = donation[0];

      /* reassign donations */

      const internalReq = { params: { id: donation.id }, body: { users_id } };
      const permissionRequired2 = false;
      const post = await this.db.postHandler(
        DONATIONS,
        internalReq,
        permissionRequired2
      );
      if (!post || post.error) {
        return post;
      }

      return true;
    },

    /**
     * Get all donations for user
     *
     * @param      {default}  body     idType (users, affected) // start, id (users_id, affected_id)
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_donations_get_all: async function (req) {
      const { id, idType, start } = req.body;
      const apiKey = req.session.apiKey;

      const users_id =
        idType === USERS ? await getUsersIdFromApiKey(apiKey) : id;

      const internalReq = { params: { id: users_id, apiKey, idType, start } };
      const idFromUser = true;
      const permissionRequired = false;
      return this.db.getHandler(
        DONATIONS,
        internalReq,
        permissionRequired,
        idFromUser
      );
    },

    /**
     * Get all donations and saved donations for user sorted by date
     *
     * @param      {default}  body     id (user_id, affected_id), idType (users, affected) // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_donations_and_saved_get_all: async function (req) {
      const { id, idType } = req.body;
      let start = req.body.start;
      const apiKey = req.session.apiKey;

      if (![USERS, AFFECTED].includes(idType)) {
        return null;
      }
      if (!start) {
        start = 0;
      }

      const users_id =
        idType === USERS ? await getUsersIdFromApiKey(apiKey) : id;

      let apiCheck = "";
      if (idType === "users") {
        apiCheck = ` AND (c.apiKey = ${mysql.escape(
          apiKey
        )} and c.apiKeyCreation >= NOW() - INTERVAL ${API_KEY_DURATION} HOUR ) `;
      }

      const query = `((SELECT CONCAT('${DONATIONS}', a.id) as id, '${DONATIONS}' as tab, a.users_id, a.affected_id, a.campaigns_id, a.created_at, a.updated_at, null as qr_code,
									a.amount, a.crncy, a.fiat_amount, a.from_recurrent, a.donation_free, a2.manual_save,
									a.txhash
							FROM ${DONATIONS} as a
								 INNER JOIN ${idType} as c on c.id = a.${idType}_id
							LEFT JOIN ${SAVED} as a2 on a2.donations_id = a.id
							WHERE c.id = ${mysql.escape(users_id)}
							${apiCheck}
							)
							UNION ALL
							(SELECT CONCAT('${SAVED}', b.id) as id, '${SAVED}' as tab, users_id, affected_id, NULL as campaigns_id, b.created_at, b.updated_at, qr_code,
									null as amount, null as crncy, null as fiat_amount, null as from_recurrent, null as donation_free,
									b.manual_save, null as txhash
							FROM ${SAVED} as b
								 INNER JOIN ${idType} as c on c.id = b.${idType}_id
								 WHERE c.id = ${mysql.escape(users_id)}
								 AND (b.donations_id IS NULL)
								 ${apiCheck}
							))
							ORDER BY created_at DESC
							LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}`;

      return this.db.customSQL(query);
    },
  },
};
