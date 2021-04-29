const mysql = require("mysql");
const utils = require("../utils.js");

const {
  DEFAULT_ERROR,
  LIMIT,
  AFFECTED,
  AFFECTEDDATA,
  QR_CODES,
  LOCATIONS,
  EDITS,
  MAX_QR_CODES,
  generatePrivateKey,
  stripPublicKey,
  getAffectedPublicKey,
  getAffectedBalance,
  createPublicKey,
  checkLimits,
} = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) Create Affected and Affected Data
     *
     * @param      {default}  body     amount
     * @param      {default}  session  // apiKey
     *
     * @returns     {default}  error | 400 | {affected_id}
     */
    affected_create: async function (req) {
      const { amount } = req.body;
      const optionalApiKey = req.session.apiKey;

      if (process.env.NODE_ENV === "production"
        && isNaN(amount) && parseInt(amount) > MAX_QR_CODES) {
        return null;
      }

      const queryResults = [];
      for (let i = 0; i < amount; i++) {
        const id = utils.uuidv4();
        const internalReq = { params: {}, body: { id, apiKey: null } };
        const permissionRequired = false;

        const affected = await this.db.putHandler(
          AFFECTED,
          internalReq,
          permissionRequired
        );

        /* get user limit */
        const limitsResult = await checkLimits(
          AFFECTEDDATA,
          null,
          optionalApiKey
        );
        if (limitsResult.error) {
          queryResults.push({ error: limitsResult.error });
          continue;
        }

        /* create private/init public key */

        if (affected.insertId != null) {
          const { seed, mnemonic } = generatePrivateKey();

          const curr_public_key = await createPublicKey(seed.plain);
          if (!curr_public_key || curr_public_key.error) {
            queryResults.push({
              error: curr_public_key ? curr_public_key.error : DEFAULT_ERROR,
            });
            continue;
          }

          const internalReq = {
            params: {},
            body: {
              affected_id: id,
              priv_key: seed.encrypted,
              mnemonic: mnemonic.encrypted,
              curr_public_key,
              curr_public_key_index: 0,
            },
          };
          const permissionRequired = false;
          const res = await this.db.putHandler(
            AFFECTEDDATA,
            internalReq,
            permissionRequired
          );
          if (!res || res.error) {
            queryResults.push({ error: res ? res.error : DEFAULT_ERROR });
            continue;
          }
          queryResults.push(id);
          continue;
        }
        queryResults.push({ error: DEFAULT_ERROR });
        continue;
      }

      const results = [];
      for (let j = 0; j < amount; j++) {
        const res = queryResults[j];

        if (!res || res.error) {
          return { error: res ? res.error : DEFAULT_ERROR };
        } else {
          results.push(res);
        }
      }

      return { affected_ids: results.join(",") };
    },

    /**
     * (Internal) Get the public key for an affected person
     *
     * @param      {default}  body    affected_id
     *
     * @returns    {default}  error | curr_public_key
     */
    affected_public_key: async function (req) {
      return await getAffectedPublicKey(req);
    },

    /**
     * (Public) Get the public key from a qr_code result
     *
     * @param      {default}   body    qr_code (url+public_key)
     *
     * @returns    {default}  error | {public_key, affected_id}
     */
    affected_public_key_from_qr: async function (req) {
      const { qr_code } = req.body;

      const init_public_key_stripped = stripPublicKey(qr_code);
      const internalReq1 = { body: { public_key: init_public_key_stripped } };
      const affectedData = await this.db.simpleGetHandler(
        QR_CODES,
        internalReq1
      );
      if (
        !affectedData ||
        affectedData.length === 0 ||
        affectedData[0].affected_id == null
      ) {
        return { error: "Code not found." };
      }
      const affected_id = affectedData[0].affected_id;

      const public_key = await getAffectedPublicKey({ body: { affected_id } });
      if (!public_key || public_key.error || public_key.length === 0) {
        return { error: public_key.error };
      }

      return { public_key, affected_id };
    },

    /**
     * (Public) Get Affected Data Package
     *
     * @param      {default}  body affected_ids (','-seperated string)
     *
     * @returns    {default}  error | result array
     */
    affected_get_data_package: async function (req) {
      const affected_ids_arr = req.body.affected_ids;

      if (!affected_ids_arr) return false;

      const affected_ids = affected_ids_arr.toString().split(",");

      //we only ever ask for LIMIT because of pagination anyway
      if (affected_ids.length > LIMIT) {
        return { error: "Max resource request amount crossed." };
      }

      let qrs = [];
      if(affected_ids.length === 1){

        //only get qr code for single data set because out of memory otherwise

        const qrs_query = `SELECT affected_id, qr_blob
         FROM ${QR_CODES}
         WHERE affected_id = ${mysql.escape(affected_ids)}
          ORDER BY created_at DESC
          LIMIT ${parseInt(LIMIT)}`;

        try {
          qrs = await this.db.customSQL(qrs_query);
          if (!qrs || qrs.error) {
            return { error: qrs ? qrs.error : DEFAULT_ERROR };
          }
        } catch(err){
          qrs = { affected_id: mysql.escape(affected_ids), qr_blob: "AAAA" } //return empty qr incase of error
        }
      }

      const locations_query = `select b.affected_id, x, y, location_description, location_address, b.created_at
						    from ( select h.*
						               , row_number() over (partition by h.affected_id order by updated_at desc) as rn
                   from ${LOCATIONS} as h
						      ) as b
							where rn = 1 and b.affected_id IN ( ${mysql.escape(affected_ids)} )
              ORDER BY b.created_at DESC
              LIMIT ${parseInt(LIMIT)}`;

      const locations = await this.db.customSQL(locations_query);
      if (!locations || locations.error) {
        return { error: locations ? locations.error : DEFAULT_ERROR };
      }

      const edits_query = `select b.affected_id, name, appearance, story, videolink
              from ( select h.*
                         , row_number() over (partition by h.affected_id order by updated_at desc) as rn
                 from ${EDITS} as h
                ) as b
            where rn = 1 and b.affected_id IN ( ${mysql.escape(affected_ids)} )
            ORDER BY b.created_at DESC
            LIMIT ${parseInt(LIMIT)}`;

      const edits = await this.db.customSQL(edits_query);

      if (!edits || edits.error) {
        return { error: edits ? edits.error : DEFAULT_ERROR };
      }
      

      const affected_query = `select b.affected_id, curr_public_key
            from ${AFFECTEDDATA} as b
            where b.affected_id IN ( ${mysql.escape(affected_ids)} )
            ORDER BY b.created_at DESC
            LIMIT ${parseInt(LIMIT)}`;

      const affected_arr = await this.db.customSQL(affected_query);
      if (!affected_arr || affected_arr.error) {
        return { error: affected_arr ? affected_arr.error : DEFAULT_ERROR };
      }

      const results = affected_arr.map((affected) => {
        const location =
          locations.find((x) => x.affected_id === affected.affected_id) || {};
        const edit = edits.find((x) => x.affected_id === affected.affected_id) || {};
        const qr = qrs.find((x) => x.affected_id === affected.affected_id) || {};
        return {
          ...qr,
          ...affected,
          ...location,
          ...edit,
        };
      });


      //for campaigns
      /*
			"f.id as campaign_id", "f.title as campaign_title", "f.description as campaign_description", "f.campaign_address as campaign_landing_address", "f.img_link as campaign_img_link", "f.fiat_amount as campaign_fiat_amount", "f.finished as campaign_finished",
			 "campaign_curr_fiat_amount"
			*/
      /*
      LEFT JOIN
      ( SELECT * FROM ${CAMPAIGNS}
      WHERE ${CAMPAIGNS}.affected_id = ${mysql.escape(affected_id)}
      AND finished is NULL
      ORDER BY created_at DESC
      LIMIT 1
        ) AS f ON a.id = f.affected_id
        
      LEFT JOIN
        ( SELECT SUM(fiat_amount) as campaign_curr_fiat_amount, campaigns_id FROM ${DONATIONS}
          WHERE txhash IS NOT NULL
        GROUP BY id
        ) AS g ON f.id = g.campaigns_id
      */

      return results;
    },
  },

  private: {
    a_affected_updated_stats: async function () {},

    /**
     * Get affected balance
     *
     * @param      {default}  body 	affected_id
     *
     * @returns     {default}  error | {balance}
     */
    a_affected_get_balance: async function (req) {
      return await getAffectedBalance(req);
    },

    /**
     * (private) Get the public key for an affected person
     *
     * @param      {default}  body    affected_id
     *
     * @returns    {default}  error | curr_public_key
     */
    a_affected_public_key: async function (req) {
      return await getAffectedPublicKey(req);
    },
  },
};
