const mysql = require("mysql");

const {
  LIMIT,
  IMGS,
  ACCOUNT_IMGS_OPTION
} = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) get all imgs or memes
     *
     * @param      {default}  body   
     * @param      {default}  session  // apiKey
     *
     * @returns    {default}  error | array
     */
     get_memes: function (req) {

      if(ACCOUNT_IMGS_OPTION === 1){
        //order by rand ok because row count is small
        const query = `SELECT link FROM ${IMGS} 
          WHERE active=1
          ORDER BY RAND() DESC
          LIMIT ${parseInt(0)}, ${parseInt(LIMIT)}`;

        return this.db.customSQL(query);
      } else if(ACCOUNT_IMGS_OPTION === 2){
        return "true";
      } else {
        return "false";
      }
  },
},
};
