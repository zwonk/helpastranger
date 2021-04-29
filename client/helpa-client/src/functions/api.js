import axios from "axios";

import utils from "functions/utils/utils";

let API_URL;
if (process.env.NODE_ENV === "production") {
  API_URL =
    process.env.REACT_APP_DEV === "true"
      ? process.env.REACT_APP_IP_DEV
      : process.env.REACT_APP_IP_LIVE;
} else {
  API_URL =
    process.env.REACT_APP_DEV === "true"
      ? process.env.REACT_APP_IP_LOCAL + ":5000"
      : "http://127.0.0.1:5000";
}
API_URL += "/";
const API_HEADERS = {};

const ERROR_DEFAULT_MESSAGE = "An unknown error occured.";

function options(url, body, token, credentials, headers = null) {
  return {
    method: "POST",
    url: url,
    data: body,
    params: { token: token },
    headers: headers || API_HEADERS,
    withCredentials: credentials,
  };
}

export async function api(func, req) {
  let data = null;

  const params = req.params ? req.params[Object.keys(req.params)[0]] : "";
  const body = req.body ? req.body : {};
  const captcha = req.captcha;

  let token;
  let action = func;

  /* try captcha */

  if (captcha && !utils.CAPTCHA_EXEMPT.includes(func)) {
    try {
      token = await captcha(action);
    } catch (err) {
      token = null;
    }
  }

  /* check auth */

  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    function (error) {
      let newError = error;
      if (error && error.response && error.response.status === 401) {
        newError = { error: "Please log in first." };
      }
      utils.clearCachedUsersId(); //TODO clear necessary? could be used checking api limits.
      return Promise.reject(newError);
    }
  );

  /* call api */

  try {
    let url = API_URL + "api/" + func + "/" + params;
    let response = await axios(options(url, body, token, true));
    let responseOK =
      response && (response.status === 200 || response.status === 400);
    if (responseOK) {
      data = await response.data;
      return data;
    }
  } catch (err) {
    if (process.env.NODE_ENV === "production") {
      console.log(err);
    } else {
      console.log(err);
      return { error: err.error || ERROR_DEFAULT_MESSAGE };
    }
  }
}

export async function auth(req) {
  let data = null;
  const body = req.body ? req.body : {};
  const captcha = req.captcha;

  let token;
  if (captcha && !utils.CAPTCHA_EXEMPT.includes("auth"))
    token = await captcha("auth"); //empty because function name would be secondary param "/fn"

  try {
    let url = API_URL + "auth/";
    let response = await axios(options(url, body, token, true));
    let responseOK =
      response && response.status === 200;
    if (responseOK) {
      data = await response.data;
      return data;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.log(err);
    } else {
      return { error: ERROR_DEFAULT_MESSAGE };
    }
  }
}

export async function authAdmin(req) {
  let data = null;
  const body = req.body ? req.body : {};
  const captcha = req.captcha;

  let token;
  if (captcha && !utils.CAPTCHA_EXEMPT.includes("authAdmin"))
    token = await captcha("admin");

  try {
    let url = API_URL + "auth/admin/";
    let response = await axios(options(url, body, token, true));
    let responseOK =
      response && response.status === 200;
    if (responseOK) {
      data = await response.data;
      return data;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.log(err);
    } else {
      return { error: ERROR_DEFAULT_MESSAGE };
    }
  }
}

export async function logout(req) {
  let data = null;

  try {
    let url = API_URL + "logout/";
    let response = await axios(options(url, {}, null, true));
    let responseOK =
      response && response.status === 200 && response.statusText === "OK";
    if (responseOK) {
      data = await response.data;
      return data;
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.log(err);
    } else {
      return { error: ERROR_DEFAULT_MESSAGE };
    }
  }
}
