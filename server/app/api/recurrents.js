const mysql = require("mysql");

const {
  LIMIT,
  USERS,
  AFFECTED,
  RECURRENT_PAYMENTS,
  getUsersIdFromApiKey,
} = require("../common.js");

/*
NOTE: CURRENTLY UNUSED
**/

module.exports = {
  private: {
    /**
     * Creates a recurrent donation.
     *
     * @param      {default}  body     amount (> 0), affected_id // pay_interval (int), paused_state (0,1)
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_recurrents_create: async function (req) {
      const {
        amount,
        fiat_amount,
        affected_id,
        pay_interval,
        paused_state,
      } = req.body;
      const apiKey = req.session.apiKey;

      const users_id = await getUsersIdFromApiKey(apiKey);

      //TODO don't create if recurrent for that users_id and affected_id already exits

      //recurrent payment can be defined in iota or fiat
      if (
        (amount != null && amount <= 0) ||
        (fiat_amount != null && fiat_amount <= 0)
      ) {
        return { error: "Can't create 0 value recurrent payments" };
      }

      const internalReq = {
        params: { apiKey },
        body: {
          amount,
          fiat_amount,
          users_id,
          affected_id,
          pay_interval,
          paused_state,
        },
      };
      const permissionRequired = false; //because getting users_id from apiKey
      return this.db.putHandler(
        RECURRENT_PAYMENTS,
        internalReq,
        permissionRequired
      );
    },

    /*
     * Changes a recurrent
     * @param      {default}  body     id (recurrent_id) // affected_id, amount ( > 0), fiat_amount (> 0), pay_interval, paused_state (0,1)
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result bool
     */
    a_recurrents_change: async function (req) {
      const bodyParams = req.body;
      const {
        id,
        amount,
        fiat_amount,
        pay_interval,
        paused_state,
      } = bodyParams;
      const apiKey = req.session.apiKey;

      if (
        (amount != null && amount <= 0) ||
        (fiat_amount != null && fiat_amount <= 0)
      ) {
        return { error: "Can't create 0 value recurrent payments" };
      }

      //User must not change users_id of payment
      delete bodyParams.users_id;

      const internalReq = {
        params: { id, apiKey },
        body: { id, amount, fiat_amount, pay_interval, paused_state },
      };
      return this.db.postHandler(RECURRENT_PAYMENTS, internalReq);
    },

    /**
     * Deletes a recurrent
     *
     * @param      {default}  body   id
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error or result bool
     */
    a_recurrents_delete: async function (req) {
      const { id } = req.body;
      const apiKey = req.session.apiKey;

      const internalReq = { params: { id, apiKey } };
      return this.db.deleteHandler(RECURRENT_PAYMENTS, internalReq);
    },

    /**
     * Toggle a recurrent paused state
     *
     * @param      {default}  body     id, paused_state (0,1) //
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result bool
     */
    a_recurrents_toggle: async function (req) {
      const { id } = req.body;
      const paused_state = parseInt(req.body.paused_state);
      const apiKey = req.session.apiKey;

      if (paused_state !== 1 && paused_state !== 0) {
        return { error: "paused_state value invalid." };
      }

      const internalReq = { params: { id, apiKey }, body: { paused_state } };
      return this.db.postHandler(RECURRENT_PAYMENTS, internalReq);
    },

    /**
     * Get all recurrents for user with donation stats
     *
     * @param      {default}  body    idType (users, affected) // id, start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    a_recurrents_get_all_with_stats: async function (req) {
      const { id, idType } = req.body;
      const start = req.body.start || 0;
      const apiKey = req.session.apiKey;

      const users_id =
        idType === USERS ? await getUsersIdFromApiKey(apiKey) : id;

      if (![USERS, AFFECTED].includes(idType)) {
        return null;
      }

      const query = ` SELECT ${RECURRENT_PAYMENTS}.*, tab1.fiat_amount_sum, tab1.donations_count FROM ${RECURRENT_PAYMENTS}
							LEFT JOIN (SELECT from_recurrent, SUM(fiat_amount) as fiat_amount_sum, COUNT(id) as donations_count FROM donations WHERE txhash IS NOT NULL GROUP BY from_recurrent) as tab1 ON tab1.from_recurrent = ${RECURRENT_PAYMENTS}.id
							LEFT JOIN ${idType} ON ${RECURRENT_PAYMENTS}.${idType}_id = ${idType}.id
							WHERE ${RECURRENT_PAYMENTS}.${idType}_id = ${mysql.escape(users_id)}
							ORDER BY ${RECURRENT_PAYMENTS}.updated_at DESC
							LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}
							`;

      return this.db.customSQL(query, [apiKey]);
    },
  },
};
