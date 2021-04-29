const mysql = require("mysql");

const {
  LIMIT,
  HOMEPAGE_LOCATIONS_LIMIT,
  AFFECTED,
  DONATIONS,
  LOCATIONS,
  PLAUSBILITY_LOCATION_DISTANCE,
  LOCATION_MAP_TIMEFRAME,
  getUsersIdFromApiKey,
  createLocation,
} = require("../common.js");

module.exports = {
  public: {
    /**
     * (Public) Get All Locations for affected
     *
     * @param      {default}  body     affected_id // start
     *
     * @returns     {default}  error | result array
     */
    locations_get_all: async function (req) {
      const { affected_id, start } = req.body;

      const internalReq = {
        params: { id: affected_id, idType: AFFECTED, start },
      };
      const idFromUser = true;
      const permissionRequired = false;
      return this.db.getHandler(
        LOCATIONS,
        internalReq,
        permissionRequired,
        idFromUser
      );
    },

    /**
     * (Public) Get All Locations For A City
     *
     * @param      {default}  body     x, y // distance, start
     *
     * @returns     {default}  error | result array
     */
    locations_get_all_for_city: async function (req) {

      //TODO query might become slow
      //TODO not just last 7 days (LOCATION_MAP_TIMEFRAME)

      const start = req.body.start || 0;
      let { x, y, distance } = req.body;

      if (!x || !y) return { error: "No location provided" };

      x = parseFloat(mysql.escape(x));
      y = parseFloat(mysql.escape(y));
      distance = distance
        ? parseFloat(mysql.escape(distance))
        : PLAUSBILITY_LOCATION_DISTANCE;

      const query = `select b.affected_id, b.x, b.y, location_description, location_address, b.created_at
						    from ( select h.*
						               , row_number() over (partition by h.affected_id order by updated_at desc) as rn
									 from ${LOCATIONS} as h
									 WHERE h.created_at >= NOW() - INTERVAL ${LOCATION_MAP_TIMEFRAME} DAY
						          ) as b
							where rn = 1
							AND ST_Distance_Sphere(point(b.x, b.y), point(${x},${y})) < ${distance}
						    ORDER BY b.created_at DESC
							LIMIT ${parseInt(mysql.escape(start))}, ${Math.max(
        HOMEPAGE_LOCATIONS_LIMIT,
        parseInt(LIMIT)
      )}`;

      /* was relevant for directly showing campaign data in the map view
       ...select
			f.title as campaign_title, f.description as campaign_description,
			f.campaign_address as campaign_landing_address, f.img_link as campaign_img_link,
			f.fiat_amount as campaign_fiat_amount, f.finished as campaign_finished,
			campaign_curr_fiat_amount
			...

			left join ( 
			SELECT * FROM ${CAMPAIGNS}
			WHERE finished is NULL
			ORDER BY created_at DESC
			LIMIT 1
			) AS f ON b.affected_id = f.affected_id
			...
			left join (
			SELECT SUM(fiat_amount) as campaign_curr_fiat_amount, campaigns_id FROM ${DONATIONS}
			WHERE txhash IS NOT NULL
			GROUP BY campaigns_id
				) AS g ON f.id = g.campaigns_id

			*/

      return this.db.customSQL(query);
    },

    /**
     * (Public) Create a location
     *
     * @param      {default}  body    affected_id // x, y, location_description
     * @param      {default}  session // apiKey
     *
     * @returns     {default}  error | result bool
     */
    locations_create: async function (req) {
      const { affected_id } = req.body;
      const bodyParams = req.body;

      const optionalApiKey = req.session.apiKey;

      /* get current user id via optionalApiKey **/
      const users_id = optionalApiKey
        ? await getUsersIdFromApiKey(optionalApiKey)
        : null;

      return createLocation(affected_id, bodyParams, users_id, optionalApiKey);
    },
  },
  private: {

     /**
     * (Public) Get All Locations For A City that a user has donated to
     *
     * @param      {default}  body     x,y, users_id // distance, start
     *
     * @returns     {default}  eror | result array
     */
    a_locations_get_all_for_city_usermatched: async function (req) {

      const start = req.body.start || 0;
      const users_id = req.body.users_id;
      let { x, y, distance } = req.body;

      if (!users_id) return { error: "Empty users_id" };
      if (!x || !y) return { error: "No location provided" };

      x = parseFloat(mysql.escape(x));
      y = parseFloat(mysql.escape(y));
      distance = distance
        ? parseFloat(mysql.escape(distance))
        : PLAUSBILITY_LOCATION_DISTANCE;

      const query = `select b.affected_id, b.x, b.y, location_description, location_address, b.created_at,
                  curr_fiat_amount
                from ( select h.*
                           , row_number() over (partition by h.affected_id order by updated_at desc) as rn
                   from ${LOCATIONS} as h
                   WHERE h.created_at >= NOW() - INTERVAL ${LOCATION_MAP_TIMEFRAME} DAY
                      ) as b
               inner join (
                SELECT SUM(fiat_amount) as curr_fiat_amount, affected_id FROM ${DONATIONS}
                 WHERE txhash IS NOT NULL
                 AND users_id = ${(mysql.escape(users_id))}
                 GROUP BY users_id, affected_id
              ) AS g ON g.affected_id = b.affected_id
              where rn = 1
              AND ST_Distance_Sphere(point(b.x, b.y), point(${x},${y})) < ${distance}
                ORDER BY b.created_at DESC
              LIMIT ${parseInt(mysql.escape(start))}, ${Math.max(
        HOMEPAGE_LOCATIONS_LIMIT,
        parseInt(LIMIT)
      )}
              `;
      return this.db.customSQL(query);
    },

    /**
     * Create a location
     *
     * @param      {default}  body     affected_id // x, y, location_description
     * @param      {default}  session  apiKey
     *
     * @returns     {default}  error | result bool
     */
    a_locations_create: async function (req) {
      const affected_id = req.body.affected_id;
      const bodyParams = req.body;
      const apiKey = req.session.apiKey;

      /* get current user id via apiKey **/
      const users_id = await getUsersIdFromApiKey(apiKey);
      if (!users_id) {
        return { error: "User not found" };
      }

      return createLocation(affected_id, bodyParams, users_id, apiKey);
    },
  },
};
