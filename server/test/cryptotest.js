console.log(process.env.NODE_ENV)
require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
console.log(process.env.pepper)

const crypto = require("../app/crypto.js");


crypto.encrypt("")