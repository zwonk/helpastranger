const { fiat_to_iota, iota_to_fiat, CRNCY } = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) iota to usd
     *
     * @param      {default}  body   amount
     * @param      {default}  session  // apiKey
     *
     * @returns    {default}  error | {usd}
     */
    iota_to_fiat: async function (req) {
      const { amount } = req.body;

      return await iota_to_fiat(CRNCY, amount);
    },

    /**
     * (Public) usd to iota
     *
     * @param      {default}  body   	amount
     * @param      {default}  session  // apiKey
     *
     * @returns    {default}  error | {iota}
     */
    fiat_to_iota: async function (req) {
      const { amount } = req.body;

      return await fiat_to_iota(CRNCY, amount);
    },
  },
};
