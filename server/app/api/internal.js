const Promise = require("bluebird");
const mysql = require("mysql");

const {
  CRNCY,
  USERS,
  USERSDATA,
  RECURRENT_PAYMENTS,
  DONATIONS,
  createDonationForAffected,
  fiat_to_iota,
  iota_to_fiat,
} = require("../common.js");

/*
NOTE: CURRENTLY UNUSED
**/

module.exports = {
  internal: {
    /**
     * (Internal) Executes all recurrent iota payments in the given interval,
     * 			  creates a donations and updates the last_execution timestamp
     * 			  in all regarded rows.
     *
     * @returns     {default}  error or result bool
     */
    cronjob_execute_recurrents: async function () {
      const PAY_INTERVAL = {
        WEEKLY: 1,
      };

      const getRecurrentsWeeklyQuery = `SELECT ${RECURRENT_PAYMENTS}.id as id, tab2.users_id, affected_id, amount, priv_key, curr_public_key, curr_public_key_index FROM ${RECURRENT_PAYMENTS}
							RIGHT JOIN ${USERS} as tab1 ON tab1.id = ${RECURRENT_PAYMENTS}.users_id
							RIGHT JOIN ${USERSDATA} as tab2 ON tab2.users_id = ${RECURRENT_PAYMENTS}.users_id
							WHERE tab1.deleted IS NULL
							AND ( paused_state IS NULL or paused_state = 0)
							AND pay_interval = ${PAY_INTERVAL.WEEKLY}
							AND ${RECURRENT_PAYMENTS}.last_execution <= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY `;

      let results, results2;

      try {
        await this.db.beginTransaction();

        results = await this.db.customSQL(getRecurrentsWeeklyQuery);

        if (!results) {
          throw new Error({
            customerror: "There was an error in the execution",
          });
        }

        async function executeDonations(results) {
          const queryPromises = [];

          for (let i in results) {
            const {
              id,
              users_id,
              affected_id,
              amount,
              priv_key,
              curr_public_key,
              curr_public_key_index,
            } = results[i];

            var { fiat_amount } = results[i];

            //fiat_amount definition takes precedence over amount
            let iota_amount = amount;
            if (fiat_amount != null) {
              iota_amount = await fiat_to_iota(CRNCY, fiat_amount);
              if (iota_amount == null || iota_amount.error) {
                return;
              }
              iota_amount = iota_amount.iota / 100; //because its in hecto fiat format
            }

            // TODO need to create public keys before for all upcoming recurrent to prevent double spent.
            const userData = {
              users_id,
              curr_public_key,
              curr_public_key_index,
            };
            const { tx, error } = await createDonationForAffected(
              affected_id,
              iota_amount,
              priv_key,
              userData
            );

            if (error) {
              //Insufficient balance or other iota error will just be ignored
              //If you are still getting an error set process.env.NODE_ENV == production
            } else {
              if (fiat_amount == null) {
                /* convert fiat to iota **/
                fiat_amount = await iota_to_fiat(CRNCY, amount);
                if (fiat_amount == null || fiat_amount.error) {
                  return;
                }
                fiat_amount = fiat_amount[CRNCY] * 100; //because its in hecto fiat format
              }

              const internalReq = {
                params: {},
                body: {
                  users_id,
                  affected_id,
                  iota_amount,
                  fiat_amount,
                  from_recurrent: id,
                  txhash: tx[0].hash,
                },
              };
              const permissionRequired = false;

              queryPromises.push(
                this.db.putHandler(DONATIONS, internalReq, permissionRequired)
              );
            }
          }

          return queryPromises;
        }

        const promises = await executeDonations(results);
        await Promise.all(promises);

        const recurrent_ids = results.map((row) => row.id).join(",");

        if (recurrent_ids.length > 0) {
          const updateRecurrentsQuery = `UPDATE ${RECURRENT_PAYMENTS} SET last_execution = NOW()
					 WHERE id IN (${mysql.escape(recurrent_ids)})`;

          results2 = await this.db.customSQL(updateRecurrentsQuery);

          if (!results2) {
            throw new Error({
              customerror: "Updating for last_execution failed",
            });
          }
        } else {
          return "Nothing to update";
        }

        await this.db.commit();

        return results2;
      } catch (err) {
        await this.db.rollback();

        if (err.customerror) {
          return { error: err.customerror };
        } else {
          if (process.env.NODE_ENV === "production") {
            return { error: "Failed recurrent_payments cronjob" };
          } else {
            throw err;
          }
        }
      }
    },

    /**
     * (Internal) Unflags all users after a week
     *
     * @returns     {default}  error or result bool
     */
    cronjob_users_unflag: async function () {
      const query = `UPDATE ${USERSDATA}
				RIGHT JOIN ${USERS} ON ${USERS}.id = ${USERSDATA}.users_id
				SET flagged = NULL
				WHERE ${USERS}.flagged <= curdate() - INTERVAL DAYOFWEEK(curdate())+6 DAY
				AND deleted IS NULL`;

      return await this.db.customSQL(query);
    },
  },
};
