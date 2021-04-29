const utils = require("../utils.js");

const {
  DONATIONS,
  SAVED,
  createSaved,
  checkLimits,
  getUsersIdFromApiKey,
} = require("../common.js");

module.exports = {
  public: {
    /**
     * Create a Save (Save a donation for later)
     *
     * @param      {default}  body     affected_id / qr_code //
     *
     * @returns     {default}  error | result bool
     */
    saved_create: async function (req) {
      const { affected_id, qr_code, manual_save, secret } = req.body;

      const secretPost = utils.uuidv4();

      const { error } = await checkLimits(SAVED, null, null);
      if (error) {
        return { error };
      }

      let donation = await this.db.simpleGetHandler(DONATIONS, {
        body: { secret },
      });

      if (!manual_save && donation && donation.length === 1) {
        return true;
      }

      return createSaved(
        affected_id,
        qr_code,
        secretPost,
        manual_save,
        null,
        null
      );
    },
  },
  private: {
    /**
     * Create a Save (Save a donation for later)
     *
     * @param      {default}  body     affected_id / qr_code //
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result bool
     */
    a_saved_create: async function (req) {
      const { affected_id, qr_code, secret, manual_save } = req.body;
      const apiKey = req.session.apiKey;

      /* get current user id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      const { error } = await checkLimits(SAVED, null, apiKey);
      if (error) {
        return { error };
      }

      if (affected_id == null && qr_code == null) {
        return { error: "Need to specify an affected_id or qr_code" };
      }

      let donation = await this.db.simpleGetHandler(DONATIONS, {
        body: { secret },
      });

      if (!manual_save && donation && donation.length === 1) {
        return true;
      }

      const secretPost = secret || utils.uuidv4();

      return createSaved(
        affected_id,
        qr_code,
        secretPost,
        manual_save,
        users_id,
        apiKey
      );
    },

    /*
     * Delete a Save
     *
     * @param      {default}  body   	id
     * @param      {default}  session  	apiKey
     *
     * @returns     {default}  error | result bool
     */
    a_saved_delete: async function (req) {
      const { id } = req.body;
      const apiKey = req.session.apiKey;

      if (!id) return { error: "id can't be null" };

      const internalReq = { params: { id, apiKey } };
      return this.db.deleteHandler(SAVED, internalReq);
    },

    /*
     * (DEPRECATED) Get All Saved
     *
     * @param      {default}  params
     * @param      {default}  body     id (users_id, affected_id), idType ("users", "affected") // start
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result array
     */
    /*a_saved_get_all: async function (req) => 
			const { id, idType, start } = req.body;
			const apiKey = req.session.apiKey;

			const internalReq = {params: {id, idType, apiKey, start}};
			const idFromUser = true;
			const permissionRequired = true;
			return this.db.getHandler(SAVED, internalReq, permissionRequired, idFromUser)
		}*/
  },
};
