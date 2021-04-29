const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

var getSHA256ofJSON = function (input) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
};

function deleteFromObject(obj, deleteableAttributes) {
  for (const d of deleteableAttributes) {
    delete obj[d];
  }
  return obj;
}

function expired(date) {
  const hour = 1000 * 60 * 60;
  return new Date(date) < Date.now() - hour;
}

module.exports = {
  uuidv4,
  getSHA256ofJSON,
  deleteFromObject,
  expired,
};
