const mysql = require("mysql");
const crypto = require("../crypto.js");
const utils = require("../utils.js");
const mailer = require("../mailer.js");

const {
  DEFAULT_ERROR,
  DOMAIN_URL,
  CRNCY,
  USERS,
  DONATIONS,
  AFFECTED,
  USERSDATA,
  MAX_DESCRIPTION_INPUT,
  MAX_MOTIVATION_INPUT,
  HELPA_EMAIL_SENDER,
  generatePrivateKey,
  createPublicKey,
  handlePassw,
  getUsersIdFromApiKey,
  checkLimits,
  iota_to_fiat,
  fiatSumCrncyAggregator,
} = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) Creates a user.
     *
     * @param      {default}  body     username, passw, agb (bool) //
     * @param      {default}  session  // apiKey
     *
     * @returns    {default}  error | 400 | {users_id}
     */
    users_create: async function (req) {
      const { username, passw, agb } = req.body;

      let errorArray = [];

      const optionalApiKey = req.session.apiKey;

      if (!agb) {
        errorArray.push({ error: "You need to check the agb." });
      }

      /* get user limit */
      const limitsResult = await checkLimits(USERSDATA, null, optionalApiKey);
      if (limitsResult.error) {
        errorArray.push({ error: limitsResult.error });
      }

      let username_valid;
      if (username != null) {
        if (username.toString().trim().length > 0) {
          username_valid = username.toString();
          username_valid = crypto.encrypt(username_valid);
        } else {
          errorArray.push({ error: "Username invalid" });
        }
      }

      /* check if username exists **/
      const user = await this.db.simpleGetHandler(USERSDATA, {
        body: { username_hash: utils.getSHA256ofJSON(username) },
      });
      if (user && user.length > 0) {
        errorArray.push({ error: "Username exists" });
      }

      const passw_enc = handlePassw(passw);
      if (passw_enc == null) {
        errorArray.push({ error: "Password too weak." });
      }

      if (errorArray.length > 0) {
        return { error: errorArray.map((e) => e.error) };
      }

      const id = utils.uuidv4();
      const internalReq = { params: {}, body: { id, apiKey: null } };
      const permissionRequired = false;
      const userBlank = await this.db.putHandler(
        USERS,
        internalReq,
        permissionRequired
      );

      if (!userBlank || userBlank.insertId === 0) {
        //0 because uuid
        const { seed, mnemonic } = generatePrivateKey();

        const curr_public_key = await createPublicKey(seed.plain);
        if (!curr_public_key || curr_public_key.error) {
          return curr_public_key;
        }

        const internalReq = {
          params: {},
          body: {
            users_id: id,
            //member_state: 1,
            priv_key: seed.encrypted,
            mnemonic: mnemonic.encrypted,
            username: username_valid.encrypted,
            username_hash: utils.getSHA256ofJSON(username_valid.plain),
            passw: passw_enc,
            curr_public_key,
            curr_public_key_index: 0,
          },
        };
        const permissionRequired = false;
        const user = await this.db.putHandler(
          USERSDATA,
          internalReq,
          permissionRequired
        );
        if (!user || user.error || user.length === 0) {
          return user;
        } else {
          return { users_id: id };
        }
      } else {
        return null;
      }
    },

    /**
     * (Public) Password recovery.
     *
     * @param      {default}  body     username (username or mail)  //
     *
     * @returns    {default}  error | 400 | true
     */
    users_forgot_passw: async function (req) {
      const { username } = req.body;

      if (!username) return { error: "Need to provide a username or email" };

      /* get new user id via username **/
      const username_email_hash = utils.getSHA256ofJSON(username);

      let userdata = await this.db.simpleGetHandler(USERSDATA, {
        body: { username_hash: username_email_hash },
      });

      if (!userdata || userdata.error) return true;

      if (userdata && userdata.length > 0) {
        userdata = userdata[0];
      } else {
        userdata = await this.db.simpleGetHandler(USERSDATA, {
          body: { email_hash: username_email_hash },
        });
        userdata = userdata[0];
      }

      if (!userdata || userdata.error || userdata.length === 0) return true;

      const passw_recovery_date = userdata.passw_recovery_date;

      if (
        userdata &&
        userdata.email &&
        (!passw_recovery_date || utils.expired(passw_recovery_date))
      ) {
        //generate new passw
        const passw_recovery = utils.uuidv4();
        const passw_recovery_enc = handlePassw(passw_recovery);
        if (!passw_recovery_enc) {
          return { error: "Internal server error" };
        }

        //send mail with new_passw
        var mailOptions = {
          from: {
            name: "helpastranger.net",
            address: HELPA_EMAIL_SENDER,
          },
          to: crypto.decrypt(userdata.email),
          subject: "Password recovery",
          text:
            "Hello " +
            crypto.decrypt(userdata.username) +
            ",\n\n" +
            "you requested a new password on " +
            DOMAIN_URL +
            "\n\n" +
            "Please use the following password at your next login and change it immediately after.\n\n" +
            "\n\n" +
            "New password: " +
            passw_recovery +
            "\n\n" +
            "\n\n" +
            "This password will expire in 1 hour." +
            "\n\n" +
            "\n\n" +
            "If you haven't requested this password recovery, you can ignore this message.",
        };

        try {
          const res = await mailer.sendMail(mailOptions);
          console.log(res);
          if (!res || !res.messageId) {
            throw new Error();
          }
        } catch (err) {
          console.log(err);
          return { error: "Error with sending email. Password not recovered." };
        }

        //update passw in database
        const internalReq = {
          params: { id: userdata.id },
          body: {
            passw_recovery: passw_recovery_enc,
            passw_recovery_date: {
              toSqlString: function () {
                return "NOW()";
              },
            },
          },
        };
        const permissionRequired = false;
        return this.db.postHandler(USERSDATA, internalReq, permissionRequired);
      }

      return true; //dont tell the user his username or email is unknown
    },
  },

  private: {
    /**
     * Get User Donation stats
     *
     * @param      {default}  body   id (users_id, affected_id), idType ("users"), crncy
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result object
     */
    a_users_donations_stats: async function (req) {
      const { id, idType, crncy } = req.body;
      const apiKey = req.session.apiKey;

      if (![AFFECTED, USERS].includes(idType)) {
        return null;
      }

      /* get current user id via apiKey **/
      const users_id =
        idType === USERS ? await getUsersIdFromApiKey(apiKey) : id;

      //no need to check apiKey validity because were getting users_id through apiKey
      const query = ` SELECT * FROM ${idType}
							LEFT JOIN (SELECT ${idType}_id , crncy as donations_crncy,  SUM(fiat_amount) as donations_fiat_amount_sum, COUNT(id) as donations_count FROM donations WHERE txhash IS NOT NULL GROUP BY users_id, crncy) as tab1 ON tab1.${idType}_id = ${idType}.id
							LEFT JOIN (SELECT ${idType}_id , crncy as cashouts_crncy,  SUM(fiat_amount) as cashouts_fiat_amount_sum, COUNT(id) as cashouts_count FROM cashouts WHERE txhash IS NOT NULL AND sendback_txhash IS NULL GROUP BY users_id, crncy) as tab2 ON tab2.${idType}_id = ${idType}.id
							LEFT JOIN (SELECT ${idType}_id , crncy as withdraws_crncy,  SUM(fiat_amount) as withdraws_fiat_amount_sum, COUNT(id) as withdraws_count FROM withdraws WHERE txhash IS NOT NULL GROUP BY users_id, crncy) as tab3 ON tab3.${idType}_id = ${idType}.id
							WHERE ${idType}.id = ${mysql.escape(users_id)}
							`;

      const res = await this.db.customSQL(query);
      if (!res || res.error) {
        return res;
      }

      const merge = true;
      return await fiatSumCrncyAggregator(
        res,
        crncy,
        ["donations", "cashouts", "withdraws"],
        merge
      );
    },

    /**
     * Update a User's data
     *
     * @param      {default}  body     // username, passw, email, real_name, address, phone
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_users_update: async function (req) {
      const body = req.body;
      let {
        username,
        passw,
        new_passw,
        new_passw2,
        email,
        real_name,
        address,
        phone,
      } = body;
      const apiKey = req.session.apiKey;

      let new_passw_enc, username_valid;

      //check input lengths
      const inputsToCheck = { email, real_name, address, phone };
      const inputsToCheckNames = {
        email: "Email",
        real_name: "Legal name",
        address: "Address",
        phone: "Phone",
      };
      for (const [key, val] of Object.entries(inputsToCheck)) {
        if (val && val.toString().length > MAX_DESCRIPTION_INPUT) {
          return {
            error:
              inputsToCheckNames[key] + " too long. Max allowed 100 characters",
          };
        }
      }

      if (passw) {
        /* check new pass validty */

        if (new_passw !== new_passw2) {
          return { error: "New Passwords don't match." };
        }

        if (new_passw != null && new_passw.length > 0) {
          new_passw_enc = handlePassw(new_passw);
          if (new_passw_enc == null) {
            return { error: "New Password too weak." };
          }
        } else {
          return { error: "Enter new password to change it." };
        }
      }

      /* get credential data */

      let users_id, userdata;

      if (username != null || passw != null) {
        /* get current user id via apiKey **/

        users_id = await getUsersIdFromApiKey(apiKey);
        if (!users_id) {
          return { error: "User does not exist." };
        }

        /* get userdata */

        userdata = await this.db.simpleGetHandler(USERSDATA, {
          body: { users_id },
        });
        if (userdata && userdata.length > 0) {
          userdata = userdata[0];
        }
      }

      if (passw) {
        /* check if old passw is correct */

        const eval_only = true;
        const passw_enc = handlePassw(passw, eval_only);

        //try passw
        let userCred = await this.db.simpleGetHandler(USERSDATA, {
          body: { username_hash: userdata.username_hash, passw: passw_enc },
        });

        //try as passw_recovery
        if (!userCred || userCred.length === 0)
          userCred = await this.db.simpleGetHandler(USERSDATA, {
            body: {
              username_hash: userdata.username_hash,
              passw_recovery: passw_enc,
            },
          });

        if (!userCred || userCred.length === 0)
          return { error: "Incorrect old password." };
      }

      if (username != null) {
        /* see if username is not empty chars */

        if (username.toString().trim().length > 0) {
          username_valid = username.toString();
          username_valid = crypto.encrypt(username_valid);
        } else return { error: "Username invalid" };

        /* see if username exists */

        const username_hash_new = utils.getSHA256ofJSON(username);
        userdataNew = await this.db.simpleGetHandler(USERSDATA, {
          body: { username_hash: username_hash_new },
        });

        if (userdataNew && userdataNew.length > 0) {
          userdataNew = userdataNew[0];
        } else {
          userdataNew = null;
        }

        if (userdataNew && users_id !== userdataNew.users_id) {
          return { error: "Username exists" };
        }
      }

      let bodySafe = {};

      // check if fields were explicitly set empty in request
      const p = (x) => body.hasOwnProperty(x);

      if (p("email")) {
        const email_hash_new = utils.getSHA256ofJSON(email);
        userdataNew = await this.db.simpleGetHandler(USERSDATA, {
          body: { email_hash: email_hash_new },
        });

        if (userdataNew && userdataNew.length > 0) {
          userdataNew = userdataNew[0];
        } else {
          userdataNew = null;
        }

        if (userdataNew && users_id !== userdataNew.users_id) {
          return { error: "Email is taken." };
        }
      }

      if (p("email"))
        bodySafe.email =
          email.length === 0 ? null : crypto.encrypt(email).encrypted;
      if (p("email"))
        bodySafe.email_hash =
          email.length === 0 ? null : utils.getSHA256ofJSON(email); //TODO empty amil working?
      if (p("real_name"))
        bodySafe.real_name =
          real_name.length === 0 ? null : crypto.encrypt(real_name).encrypted;
      if (p("address"))
        bodySafe.address =
          address.length === 0 ? null : crypto.encrypt(address).encrypted;
      if (p("phone"))
        bodySafe.phone =
          phone.length === 0 ? null : crypto.encrypt(phone).encrypted;

      if (username_valid) bodySafe.username = username_valid.encrypted;
      if (username_valid)
        bodySafe.username_hash = utils.getSHA256ofJSON(username_valid.plain);
      if (new_passw_enc) bodySafe.passw = new_passw_enc;
      if (new_passw_enc && userdata.passw_recovery)
        bodySafe.passw_recovery = null;
      if (new_passw_enc && userdata.passw_recovery)
        bodySafe.passw_recovery_date = null;

      if (Object.entries(bodySafe).length === 0) return true;

      const internalReq = { params: { apiKey }, body: bodySafe };
      const permissionRequired = true;
      const apiAsId = true;
      return this.db.postHandler(
        USERSDATA,
        internalReq,
        permissionRequired,
        apiAsId
      );
    },

    /**
     * Update a User's data
     *
     * @param      {default}  body     motivation //
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_users_membership_apply: async function (req) {
      let { motivation } = req.body;
      const apiKey = req.session.apiKey;

      if (!motivation) {
        return { error: "Motivation not set." };
      }

      if (motivation.toString().length > MAX_MOTIVATION_INPUT) {
        return {
          error: `Allowed chars for motivation: ${MAX_MOTIVATION_INPUT}.`,
        };
      }

      var mailOptions = {
        from: HELPA_EMAIL_SENDER,
        to: HELPA_EMAIL_SENDER,
        subject: "Membership application",
        text: "Somebody applied for membership!" + "\n\n" + motivation + "\n\n",
      };

      try {
        const res = await mailer.sendMail(mailOptions);
        console.log(res);
        if (!res || !res.messageId) {
          throw new Error();
        }
      } catch (err) {
        console.log(err);
        /* no error handling necessary cause membershp will be noticed in admin panel */
      }

      //don't check for multi apply, since it will only change one data row, and is also prevented in ui

      const membership_applied = {
        toSqlString: function () {
          return "NOW()";
        },
      };

      const internalReq = {
        params: { apiKey },
        body: {
          membership_motivation: crypto.encrypt(motivation).encrypted,
          membership_applied,
        },
      };
      const permissionRequired = true;
      const apiAsId = true;
      return this.db.postHandler(
        USERSDATA,
        internalReq,
        permissionRequired,
        apiAsId
      );
    },

    /**
     * Delete a user
     *
     * @param      {default}  body     users_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result bool
     */
    a_users_delete: async function (req) {
      const { users_id } = req.body;
      const apiKey = req.session.apiKey;

      const internalReq = {
        params: { id: users_id, apiKey },
        body: { deleted: 1 },
      };
      const permissionRequired = true;
      const apiAsId = true;
      return this.db.postHandler(
        USERSDATA,
        internalReq,
        permissionRequired,
        apiAsId
      );
    },

    /**
     * Get all data for a user
     *
     * @param      {default}  params   users_id
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | data object
     */
    a_users_get_data: async function (req) {
      const { users_id } = req.body;
      const apiKey = req.session.apiKey;

      /* get current user **/
      const permissionRequired = true;
      const idFromUser = true;
      let user = await this.db.getHandler(
        USERSDATA,
        { params: { id: users_id, idType: USERS, apiKey } },
        permissionRequired,
        idFromUser
      );
      if (user == null || (user && user.length !== 1)) {
        return { error: "Resource can't be loaded." };
      }
      const {
        curr_public_key,
        username,
        email,
        member_state,
        membership_applied,
        real_name,
        address,
        phone,
        total_donated,
        total_donated_month,
        total_withdrawn,
        created_at,
      } = user[0];

      let curr_public_key_checksum = curr_public_key;
      if (parseInt(process.env.IOTA_CHRYSALIS)) {
        curr_public_key_checksum = await this.iotaH.iotaCreateChecksum({
          body: { address: curr_public_key },
        });

        if (!curr_public_key_checksum || curr_public_key_checksum.error)
          return curr_public_key_checksum;
      }

      return {
        users_id,
        curr_public_key,
        curr_public_key_checksum,
        username: crypto.decrypt(username),
        member_state,
        membership_applied,
        email: crypto.decrypt(email),
        real_name: crypto.decrypt(real_name),
        address: crypto.decrypt(address),
        phone: crypto.decrypt(phone),
        total_donated,
        total_donated_month,
        total_withdrawn,
        created_at,
      };
    },

    /**
     * Get priv_key for user
     *
     * @param      {default}  params   users_id
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | data object
     */
    a_users_get_private_key: async function (req) {
      const { users_id } = req.body;
      const apiKey = req.session.apiKey;

      /* get current user **/
      const permissionRequired = true;
      const idFromUser = true;
      let user = await this.db.getHandler(
        USERSDATA,
        { params: { id: users_id, idType: USERS, apiKey } },
        permissionRequired,
        idFromUser
      );
      if (user == null || (user && user.length !== 1)) {
        return { error: "Resource can't be loaded." };
      }
      const { mnemonic } = user[0];

      return {
        private_key: crypto.decrypt(mnemonic),
      };
    },

    /**
     *  Get user balance
     *
     * @param      {default}  body    	//
     * @param      {default}  session   apiKey
     *
     * @returns     {default}  {balance}
     */
    a_users_get_balance: async function (req) {
      const apiKey = req.session.apiKey;
      const crncy = req.body.crncy || CRNCY;

      const users_id = await getUsersIdFromApiKey(apiKey);

      /* get current user */
      const permissionRequired = true;
      const idFromUser = true;
      let user = await this.db.getHandler(
        USERSDATA,
        { params: { id: users_id, idType: USERS, apiKey } },
        permissionRequired,
        idFromUser
      );
      if (user == null || (user && user.length !== 1)) {
        return { error: "Resource can't be loaded." };
      }
      user = user[0];

      const { curr_public_key } = user;
      const res = await this.iotaH.iotaGetBalance({
        body: { curr_public_key },
      });
      if (!res || !res.balance || res.error) {
        return { error: res ? res.error : DEFAULT_ERROR };
      }

      let fiat_balance = await iota_to_fiat(crncy, res.balance.balance);
      if (fiat_balance != null && !fiat_balance.error) {
        fiat_balance = fiat_balance[crncy] * 100; //because hector fiat
      } else {
        fiat_balance = null;
      }

      let refreshNecessary = false;

      if (res.balance === 0) {
        const customSQLQuery = `SELECT * FROM ${DONATIONS}
         WHERE users_id = ${users_id}
         AND updated_at >= NOW() - INTERVAL 10 SECOND
         LIMIT 1`;
        const first = true;
        const recentDonation = await this.db.customSQL(
          customSQLQuery,
          [],
          [],
          first
        );
        if (recentDonation) {
          refreshNecessary = true;
        }
      }

      return {
        balance: res.balance.balance,
        dustAllowed: res.balance.dustAllowed,
        fiat_balance: Number(Number(fiat_balance).toFixed(2)),
        crncy: crncy,
        refreshNecessary,
      };
    },

    /**
     *  Get anothers users balance
     *
     * @param      {default}  body    	users_id //
     * @param      {default}  session   apiKey
     *
     * @returns     {default}  {balance}
     */
    a_users_get_public_key: async function (req) {
      const { id } = req.body; //id is correct

      /* get current user **/

      //no permission because only public key is returned
      const permissionRequired = false;
      const idFromUser = true;
      let user = await this.db.getHandler(
        USERSDATA,
        { params: { idType: USERS, id } },
        permissionRequired,
        idFromUser
      );
      if (user == null || (user && user.length !== 1)) {
        return { error: "Resource can't be loaded." };
      }
      user = user[0];

      const curr_public_key = await this.iotaH.iotaGetAddress({
        body: { priv_key: user.priv_key },
      });
      if (curr_public_key.error) {
        return curr_public_key;
      }
      return curr_public_key;
    },
  },
};
