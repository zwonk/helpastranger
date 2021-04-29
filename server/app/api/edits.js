const {
  EDITS,
  MAX_DESCRIPTION_INPUT,
  MAX_DESCRIPTION_NAME_INPUT,
  getUsersIdFromApiKey,
  checkLimits,
} = require("../common.js");

module.exports = {
  private: {
    /**
     * Create an edit
     *
     * @param      {default}  body     affected_id // name, description, story
     * @param      {default}  session  apiKey
     *
     * @returns    {default}  error | result bool
     */
    a_edits_create: async function (req) {
      const { affected_id } = req.body;
      const bodyParams = req.body;
      const apiKey = req.session.apiKey;

      if (affected_id == null) {
        return { error: "Need to specify an affected_id." };
      }

      /* get current user id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      const { error } = await checkLimits(EDITS, null, apiKey);
      if (error) {
        return { error };
      }

      /* check input length */
      for (let [key, val] of Object.entries(bodyParams)) {
        if (
          key !== "affected_id" &&
          key !== "users_id" &&
          val &&
          val.toString().length > MAX_DESCRIPTION_INPUT
        )
          return { error: "Input too long. Max allowed 100 characters" };
        if (
          key === "name" &&
          val &&
          val.toString().length > MAX_DESCRIPTION_NAME_INPUT
        )
          return { error: "Name too long. Just put a nickname." };
      }

      const internalReq = {
        params: { apiKey },
        body: { ...bodyParams, users_id },
      };
      const permissionRequired = false;
      return this.db.putHandler(EDITS, internalReq, permissionRequired);
    },
  },
};
