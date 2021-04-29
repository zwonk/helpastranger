var mysql = require("mysql");
const promisify = require("util");
const utils = require("./utils.js");

const config = process.env.db_url;

const {
  API_KEY,
  API_KEY_DURATION,
  LIMIT,
  USERS,
  AFFECTED,
  USERS_ID,
} = require("./constants.js");

function DB() {
  this.simpleGetHandler = async (table, req) => {
    const bodyParams = req.body;

    var getCommands;
    var values = [];
    const bodyParamsKeys = Object.keys(bodyParams);

    if (bodyParamsKeys && bodyParamsKeys.length > 0) {
      getCommands = "WHERE ";

      for (const b in bodyParamsKeys) {
        const param = bodyParamsKeys[b];
        if (param === API_KEY) {
          getCommands += ` apiKeyCreation >= NOW() - INTERVAL ${API_KEY_DURATION} HOUR AND `;
        }
        getCommands += `${param.split("\s+").join("")} = ? AND `; // TODO check for risk
        values.push(bodyParams[param]);
      }
      getCommands = getCommands.slice(0, -4);
    }

    const query = `SELECT * FROM ${table} 
		  				 ${getCommands}`;

    const results = await this.queryWrapper(query, values);
    return results;
  };

  this.getHandler = async (
    table,
    req,
    permissionRequired = true,
    idFromUser = false,
    injectSQL = ""
  ) => {
    const idType = req.params.idType;
    const id = req.params.id;
    const apiKey = req.params.apiKey;
    let start = req.params.start;

    if (![USERS, AFFECTED].includes(idType)) {
      return null;
    }
    if (!start) {
      start = 0;
    }

    let query = null;

    if (!permissionRequired) {
      query = `SELECT *, ${table}.id as ${table}_id FROM ${idType}
		  				 RIGHT JOIN ${table} ON ${idType}.id = ${table}.${idType}_id
		  				 WHERE ${idFromUser ? idType : table}.id = ${mysql.escape(id)}
		  				 ${injectSQL}
		  				 ORDER BY ${table}.updated_at DESC
		  				 LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}`;
    } else {
      query = `SELECT *, ${table}.created_at as created_at_2, ${table}.updated_at as updated_at_2, ${table}.id as ${table}_id
						 FROM ${idType} as tab1
		  				 RIGHT JOIN ${table} ON tab1.id = ${table}.${idType}_id
		  				 RIGHT JOIN ${USERS} ON ${USERS}.id = ${table}.users_id
		  				 WHERE ${idFromUser ? "tab1" : table}.id = ${mysql.escape(id)}
		  				 AND (tab1.apiKey = ${mysql.escape(
                 apiKey
               )} and tab1.apiKeyCreation >= NOW() - INTERVAL ${API_KEY_DURATION} HOUR )
		  				 ${injectSQL}
		  				 ORDER BY ${table}.updated_at DESC
		  				 LIMIT ${parseInt(mysql.escape(start))}, ${parseInt(LIMIT)}`;
    }

    const results = await this.queryWrapper(query, []);
    return results;
  };

  this.postHandler = async (
    table,
    req,
    permissionRequired = true,
    apiKeyAsId = false,
    postViaUserId = false,
    injectSQL = ""
  ) => {
    const bodyParams = req.body;
    const idType = req.params.idType || USERS;
    const id = req.params.id;
    const apiKey = req.params.apiKey;

    if (![USERS, AFFECTED].includes(idType)) {
      return null;
    }

    //only allowing params to change table values (t) not USERS table
    let bodyParamsAdjusted = {};
    for (const [key, value] of Object.entries(bodyParams)) {
      bodyParamsAdjusted[`t.${key}`] = value;
    }

    let query = null;

    if (!permissionRequired) {
      query = `UPDATE ${table} as t
				   SET ? 
					  WHERE ${postViaUserId ? `t.${idType}_id` : `t.id`} = ${mysql.escape(id)}
					  ${injectSQL}
	  				`;
    } else {
      query = `UPDATE ${table} as t
					RIGHT JOIN ${USERS} as tab1 ON tab1.id = t.${idType}_id
				   	SET ? 
					   WHERE
		  			${
              !apiKeyAsId
                ? `${
                    postViaUserId ? `t.${idType}_id` : `t.id`
                  } = ${mysql.escape(id)} AND `
                : " "
            }
					  (tab1.apiKey = ${mysql.escape(
              apiKey
            )} and tab1.apiKeyCreation >= NOW() - INTERVAL ${API_KEY_DURATION} HOUR )
					  ${injectSQL}
	  				`;
    }

    const results = await this.queryWrapper(query, bodyParamsAdjusted);
    return results;
  };

  this.putHandler = async (table, req, permissionRequired = true) => {
    const bodyParams = req.body;
    const apiKey = req.params.apiKey;

    let query = null;

    if(bodyParams["id"] == null) {
      bodyParams["id"] = utils.uuidv4()
    }

    if (!permissionRequired) {
      query = `INSERT INTO ${table} SET ?`;
    } else {
      if (bodyParams[USERS_ID] !== false) {
        const userHasRight = await this.simpleGetHandler(USERS, {
          body: { id: bodyParams[USERS_ID], apiKey },
        });

        if (userHasRight && userHasRight.length > 0) {
          query = `INSERT INTO ${table} SET ?`;
        }
      }
    }

    if (!query) return null;

    const results = await this.queryWrapper(query, bodyParams);
    return results;
  };

  this.deleteHandler = async (table, req, permissionRequired = true) => {
    const id = req.params.id;
    const apiKey = req.params.apiKey;

    let query = null;

    if (!permissionRequired) {
      query = `DELETE FROM ${table} WHERE id = ${mysql.escape(id)}`;
    } else {
      const userHasRight = await this.getHandler(table, {
        params: { id, apiKey, idType: USERS },
      });

      if (userHasRight && userHasRight.length > 0) {
        query = `DELETE FROM ${table} WHERE id = ${mysql.escape(id)}`;
      }
    }

    const results = await this.queryWrapper(query);
    return results;
  };

  this.customSQL = async (
    query,
    values = [],
    deleteableAttributes = [],
    first = false
  ) => {
    return await this.queryWrapper(query, values, deleteableAttributes, first);
  };

  this.queryWrapper = async (
    query,
    values = [],
    deleteableAttributes = [],
    first = false
  ) => {
    let results = null;
    const db = makeDb(config);
    try {
      console.log(query);
      if (process.env.NODE_ENV !== "production") {
        console.log(values);
      }
      results = await db.query(query, values);
      if (first) {
        if (results && results.length > 0) {
          let result = results[0];
          result = utils.deleteFromObject(result, deleteableAttributes);
          results = result;
        } else {
          return null;
        }
      } else {
        if (results && results.length > 0 && deleteableAttributes.length > 0)
          return results.map((r) =>
            utils.deleteFromObject(r, deleteableAttributes)
          );
        else return results;
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        throw err;
      } else {
        return null;
      }
    } finally {
      await db.close();
    }
    return results;
  };

  this.beginTransaction = async () => {
    this.db = makeDb(config);
    return this.db.beginTransaction();
  };

  this.commit = async () => {
    await this.db.commit();
    return this.db.close();
  };

  this.rollback = async () => {
    await this.db.rollback();
    return this.db.close();
  };

  function makeDb(config) {
    const connection = mysql.createConnection(config);
    return {
      beginTransaction() {
        return promisify
          .promisify(connection.beginTransaction)
          .call(connection);
      },
      commit() {
        return promisify.promisify(connection.commit).call(connection);
      },
      rollback() {
        return promisify.promisify(connection.rollback).call(connection);
      },
      query(sql, args) {
        return promisify
          .promisify(connection.query)
          .call(connection, sql, args);
      },
      close() {
        return promisify.promisify(connection.end).call(connection);
      },
    };
  }
}
const db = new DB();
module.exports = db;
