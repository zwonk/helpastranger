const mysql = require("mysql");
const utils = require("../utils.js");

const {
  LIMIT,
  DEFAULT_ERROR,
  MAX_QR_CODES,
  QR_RESOLUTION_LOW_FIXED,
  USERS,
  QR_CODES,
  DONATIONS,
  createQrCodeForAffected,
  getUsersIdFromApiKey,
  checkLimits,
  fiatSumCrncyAggregator,
} = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) Create Qr Code
     *
     * @param      {default}  body   affected_ids (comma-seperated string), qr_low_res (true 72dpi qr codes)
     * @param      {default}  session  // apiKey
     *
     * @returns    {default}  error | {[public_keys], [qr_blobs], [secrets]}
     */
    qr_codes_create: async function (req) {
      const { affected_ids, qr_low_res } = req.body;
      const optionalApiKey = req.session.apiKey;

      const users_id = optionalApiKey
        ? await getUsersIdFromApiKey(optionalApiKey)
        : null;

      const affected_arr = affected_ids.split(",");
      if (!affected_arr || affected_arr.length === 0) {
        return null;
      }

      if (process.env.NODE_ENV === "production"
        && affected_arr.length > MAX_QR_CODES) {
        return { error: "Max simultaneous Qr codes reached." };
      }

      const queryResults = [];
      for (let i = 0; i < affected_arr.length; i++) {
        const affected_id = affected_arr[i];

        /* get user limit */
        const limitsResult = await checkLimits(QR_CODES, null, optionalApiKey);
        if (limitsResult.error) {
          queryResults.push({ error: limitsResult.error });
          continue;
        }

        const qr_low_res_post = QR_RESOLUTION_LOW_FIXED || qr_low_res;

        const { public_key, qr_blob, error } = await createQrCodeForAffected(
          affected_id, qr_low_res_post
        );

        if (error) {
          queryResults.push({ error });
          continue;
        }

        const secret = utils.uuidv4();

        const bodyParamsNew = {
          users_id,
          affected_id,
          public_key,
          qr_blob,
          secret,
        };
        const internalReq = { params: {}, body: bodyParamsNew };
        const permissionRequired = false;
        const res = await this.db.putHandler(
          QR_CODES,
          internalReq,
          permissionRequired
        );
        if (!res || res.error) {
          queryResults.push(res);
          continue;
        }

        queryResults.push({ public_key, qr_blob, secret });
      }

      const results = [];
      for (let j = 0; j < affected_arr.length; j++) {
        const res = queryResults[j];
        if (!res || res.error) {
          return { error: res ? res.error : DEFAULT_ERROR };
        } else {
          results.push(res);
        }
      }

      return {
        public_keys: results.map((x) => x.public_key),
        qr_blobs: results.map((x) => x.qr_blob),
        secrets: results.map((x) => x.secret),
      };
    },

    /**
     * (Public) Count Qr codes used on platform.
     *
     *
     * @returns    {default}  error | {qr_codes_total_used}
     */
    qr_codes_get_platform_count: async function (req) {
      const query = ` SELECT COUNT(a.id) as qr_codes_total_used from ${QR_CODES} as a
        WHERE a.id IN (
        SELECT c.id FROM qr_codes as c
        INNER JOIN ${DONATIONS} as b
              ON c.affected_id = b.affected_id
              WHERE b.txhash IS NOT NULL 
        GROUP BY (c.id) 
    )`;

      const first = true;
      return this.db.customSQL(query, [], [], first);
    },
  },

  private: {
    /**
     * Create Qr Code
     *
     * @param      {default}  body     affected_ids,  qr_low_res (true = 72dpi qr codes) //
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | {public_key, qr_blob}
     */
    a_qr_codes_create: async function (req) {
      const { affected_ids, qr_low_res } = req.body;
      const apiKey = req.session.apiKey;

      const users_id = await getUsersIdFromApiKey(apiKey);

      const affected_arr = affected_ids.split(",");
      if (!affected_arr || affected_arr.length === 0) {
        return null;
      }

      const queryResults = [];
      for (let i = 0; i < affected_arr.length; i++) {
        const affected_id = affected_arr[i];

        /* get user limit */
        const limitsResult = await checkLimits(QR_CODES, null, apiKey);
        if (limitsResult.error) {
          queryResults.push({ error: limitsResult.error });
          continue;
        }

        const qr_low_res_post = QR_RESOLUTION_LOW_FIXED || qr_low_res;

        const { public_key, qr_blob, error } = await createQrCodeForAffected(
          affected_id, qr_low_res_post
        );

        if (error) {
          queryResults.push({ error });
          continue;
        }

        const bodyParamsNew = { users_id, affected_id, public_key, qr_blob };
        const internalReq = { params: { apiKey }, body: bodyParamsNew };
        const permissionRequired = false;
        const put = await this.db.putHandler(
          QR_CODES,
          internalReq,
          permissionRequired
        );
        if (!put || put.error) {
          queryResults.push({ put });
          continue;
        }

        queryResults.push({ public_key, qr_blob });
        continue;
      }

      const results = [];
      for (let j = 0; j < affected_arr.length; j++) {
        const res = queryResults[j];
        if (!res || res.error) {
          return { error: res ? res.error : DEFAULT_ERROR };
        } else {
          results.push(res);
        }
      }

      return {
        public_keys: results.map((x) => x.public_key),
        qr_blobs: results.map((x) => x.qr_blob),
      };
    },

    /**
     * Reassign publicly created qr_code to user
     *
     * @param      {default}  body     secret //
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | true
     */
    a_qr_codes_account_assign: async function (req) {
      const { secrets } = req.body;
      const apiKey = req.session.apiKey;

      const secrets_arr = secrets;
      if (!secrets_arr || secrets_arr.length === 0) {
        return null;
      }

      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      /* check if transaction matches secret */

      const queryResults = [];
      for (let i = 0; i < secrets.length; i++) {
        const secret = secrets_arr[i];

        let qr_code = await this.db.simpleGetHandler(QR_CODES, {
          body: { secret },
        });

        if (qr_code == null || (qr_code && qr_code.length !== 1)) {
          queryResults.push({ error: "Qr code not accessible." });
          continue;
        }

        qr_code = qr_code[0];

        /* reassign donations */

        const internalReq = { params: { id: qr_code.id }, body: { users_id } };
        const permissionRequired2 = false;
        const post = await this.db.postHandler(
          QR_CODES,
          internalReq,
          permissionRequired2
        );
        if (!post || post.error) {
          queryResults.push({ error: post ? post : post.error });
          continue;
        }

        queryResults.push(true);
      }

      for (let j = 0; j < secrets_arr.length; j++) {
        const res = queryResults[j];
        if (!res || res.error){
          return { error: res ? res.error : DEFAULT_ERROR };
        }
      }

      return true;
    },

    /* DEPRECATED */
    /*
     * Delete Qr Codes
     *
     * @param      {default}  params   id (id of qr_code) //
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result bool
     */
    /*a_qr_codes_delete = (req) => {
			const { id } = req.body
			const apiKey = req.session.apiKey;

			const internalReq = {params: {id, apiKey}};
			return this.db.deleteHandler(QR_CODES, internalReq)
		}*/

    /* DEPRECATED */
    /*
     * Get All Created Qr Codes
     *
     * @param      {default}  body     id (users_id, affected_id), idType (users, affected) // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    /*a_qr_codes_get_all: async function (req) {
			const {id, idType, start} = req.body;
			const apiKey = req.session.apiKey

			const users_id = idType === USERS ? await getUsersIdFromApiKey(apiKey) : id

			const internalReq = {params: {id: users_id, idType, apiKey, start}};
			const idFromUser = true;
			const permissionRequired = false;
			return this.db.getHandler(QR_CODES, internalReq, permissionRequired, idFromUser)
		}*/

    /**
     * Get Currently Associated Qr Codes with donations stats
     *
     * @param      {default}  body    // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_qr_codes_get_all_with_stats: async function (req) {
      const start = req.body.start || 0;
      const apiKey = req.session.apiKey;
      const crncy = req.body.crncy;

      let orderSQL = ` ORDER BY ${QR_CODES}.updated_at DESC `
      //no need to check apiKey validity because its running through authCheck
      const query = (orderSQL) => ` SELECT ${QR_CODES}.*, tab1.donations_fiat_amount_sum, tab1.donations_count, tab1.donations_crncy FROM ${QR_CODES}
							LEFT JOIN ${USERS} as tab1 ON ${QR_CODES}.users_id = tab1.id
							LEFT JOIN (SELECT affected_id as affected_id2, crncy as donations_crncy, SUM(fiat_amount) as donations_fiat_amount_sum, SUM(id) as donations_count FROM donations WHERE txhash IS NOT NULL GROUP BY affected_id2, crncy) as tab1 ON tab1.affected_id2 = ${QR_CODES}.affected_id
			  				WHERE (tab1.apiKey = ?)
			  				${orderSQL}
							LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}
			  				`; //TODO its slow because of summing per currencies for each QrCOde

      //because of out of memory
      let res;
      try{
         res = await this.db.customSQL(query(orderSQL), [apiKey]);
      }
      catch(err){
        res = await this.db.customSQL(query(""), [apiKey]);
      }

      const aggr = await fiatSumCrncyAggregator(res, crncy, ["donations"]);
      return aggr;
    },
  },
};
