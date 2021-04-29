const { REPORTS, getUsersIdFromApiKey } = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) Creates an (issue) report.
     *
     * @param      {default}  body     // content, context, view
     * @param      {default}  session  // apiKey
     *
     * @returns    {default}  error | result bool
     */
    reports_add: async function (req) {
      const { content, context, view } = req.body;
      const optionalApiKey = req.session.apiKey;

      let users_id;
      if (optionalApiKey) {
        users_id = optionalApiKey
          ? await getUsersIdFromApiKey(optionalApiKey)
          : null;
      }

      const internalReq = {
        params: { apiKey: optionalApiKey },
        body: { content, context, view, users_id },
      };
      const permissionRequired = false;
      return this.db.putHandler(REPORTS, internalReq, permissionRequired);
    },
  },
};
