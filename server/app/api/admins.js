const {
  USERS,
  USERSDATA,
  ADMIN_ACTIONS,
  getAdminsIdFromApiKey,
} = require("../common.js");

const crypto = require("../crypto.js");

const self = (module.exports = {

  private: {
  /**
   * (Private) Returns data for all users marked as members
   *
   * @param      {default}  body   //
   * @param      {default}  session  apiKey
   *
   * @returns     {default}  [users], error or result bool
   */
    a_admins_get_members_data: async function (req) {
      return self.private.a_admins_get_users_data.bind(this, {
        ...req,
        body: { members: true },
      })();
    },

    /**
     * (Private) Returns data for all membership applicants
     *
     * @param      {default}  body   // members (bool)
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  [users], error or result bool
     */
    a_admins_get_users_data: async function (req) {
      const { members } = req.body;
      const apiKey = req.session.apiKey;

      /* get current user id via apiKey **/
      const admins_id = await getAdminsIdFromApiKey(apiKey);
      console.log(admins_id);
      if (!admins_id) return false;

      const member_query = members
        ? " a.member_state > 0 "
        : " a.membership_applied IS NOT NULL AND (a.member_state IS NULL OR a.member_state = 0) ";

      //no need to check apiKey validity because were getting users_id through apiKey

      //TODO proper currencies for fiat_amount
      const query = ` SELECT *, a.users_id as users_id FROM ${USERSDATA} as a
              LEFT JOIN (SELECT ${USERS}_id , SUM(fiat_amount) as donations_fiat_amount_sum, COUNT(id) as donations_count FROM donations WHERE txhash IS NOT NULL GROUP BY users_id) as tab1 ON tab1.${USERS}_id = a.users_id
              LEFT JOIN (SELECT ${USERS}_id , SUM(fiat_amount) as cashouts_fiat_amount_sum, COUNT(id) as cashouts_count FROM cashouts WHERE txhash IS NOT NULL AND sendback_txhash IS NULL GROUP BY users_id) as tab2 ON tab2.${USERS}_id = a.users_id
              LEFT JOIN (SELECT ${USERS}_id , SUM(fiat_amount) as withdraws_fiat_amount_sum, COUNT(id) as withdraws_count FROM withdraws WHERE txhash IS NOT NULL GROUP BY users_id) as tab3 ON tab3.${USERS}_id = a.users_id
              WHERE ${member_query}
              ORDER BY a.membership_applied DESC
              `;

      //TODO check what sensitive fields to make unavailable inside db.js

      const ignore = [
          "id",
          "username",
          "username_hash",
          "priv_key",
          "passw",
          "passw_recovery",
          "passw_recovery_date",
          "mnemonic",
      ];
      const res = await this.db.customSQL(
        query,
        [],
        ignore
      );
      if (!res || res.error) {
        return res;
      }

      const decryp_res = res.map((r) => ({
        ...r,
        real_name: crypto.decrypt(r.real_name),
        email: crypto.decrypt(r.email),
        phone: crypto.decrypt(r.phone),
        address: crypto.decrypt(r.address),
        membership_motivation: crypto.decrypt(r.membership_motivation),
      }));

      return decryp_res;
    },

    a_admins_get_limits: async function (req) {
      return {};
    },

    /**
     * (Private) Admin Action (admin must be in admin table)
     *
     * @param      {default}  body   users_id, action ("MAKE_MEMBER","FLAG_MEMBER","UNMAKE_MEMBER", "UNMAKE_MEMBER")
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error or result bool
     */
    a_admins_action: async function (req) {
      const { users_id, action } = req.body;
      const apiKey = req.session.apiKey;

      /* get current user id via apiKey **/
      const admins_id = await getAdminsIdFromApiKey(apiKey);
      if (!admins_id) return false;

      /* set target member_state **/
      let actionSQL;
      if (action === ADMIN_ACTIONS.MAKE_MEMBER) {
        actionSQL = " member_state = 1, membership_changed = NOW() ";
      } else if (action === ADMIN_ACTIONS.FLAG_MEMBER) {
        actionSQL = " flagged = NOW() ";
      } else if (action === ADMIN_ACTIONS.UNMAKE_MEMBER) {
        actionSQL = " member_state = 0, membership_changed = NOW()  ";
      } else if (action === ADMIN_ACTIONS.UNFLAG_MEMBER) {
        actionSQL = " flagged = NULL ";
      } else {
        return { error: "Action unknown." };
      }
      const query = `UPDATE ${USERSDATA} SET ${actionSQL} WHERE users_id = ?`;
      return this.db.customSQL(query, [users_id]);
    },
  },
});
