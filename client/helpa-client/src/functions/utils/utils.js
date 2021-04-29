import currencySymbols from "./currencySymbols";

const AFFECTED_DATA = "affected_data";
const AFFECTED_DATA_LOCATIONS = "affected_data_locations";
const USERS_ID = "users_id";
const DONATION_DATA = "donation_data";
const STORAGE_HASH = "storage_hash";

function utils() {}

utils.MI = 1000000;
utils.KI = 1000;
utils.IOTA_EXPLORER = parseInt(process.env.REACT_APP_CHRYSALIS)
  ? !process.env.REACT_APP_DEV || process.env.REACT_APP_DEV === "true"
    ? "https://explorer.tanglebay.com/comnet/message/"
    : "https://explorer.iota.org/mainnet/transaction/"
  : "https://explorer.iota.org/legacy-devnet/transaction/";

utils.IOTA_EXPLORER_ADDRESS = parseInt(process.env.REACT_APP_CHRYSALIS)
  ? !process.env.REACT_APP_DEV || process.env.REACT_APP_DEV === "true"
    ? "https://explorer.tanglebay.com/comnet/addr/"
    : "https://explorer.iota.org/mainnet/addr/"
  : "https://explorer.iota.org/legacy-devnet/addr/";

utils.ZOOM_START = 17;
utils.ZOOM_START_MAIN = 11;
utils.TEN_SEC = 10000;
utils.TWO_MIN = 120000;
utils.NO_ERROR = "0";
utils.USERS_ID = "users_id";
utils.USERS = "users";
utils.REFETCH_TIME = process.env.NODE_ENV === "production" ? 4000 : 5000;
utils.HOME_MAP_SET_DEFAULT_LOCATION = parseInt(
  process.env.REACT_APP_HOME_MAP_SET_DEFAULT_LOCATION
);
utils.DEFAULT_ERROR = "Errors happen... Just try again.";
utils.ROLLOUT_CAMPAIGNS = false;
utils.ROLLOUT_RECURRENTS = false;
utils.DOMAIN_URL = "https://" + process.env.REACT_APP_DOMAIN;
utils.MAIL = "info@" + process.env.REACT_APP_DOMAIN;
utils.QR_SITE = "q";
utils.HASH_LENGTH = 64;
utils.LIMIT = 25;
utils.EMOJI_LABELS = {
  "emoji-yellow-heart": "💛",
  "emoji-heart": "❤️",
  "emoji-food": "🍲",
  "emoji-hotel": "🏨",
  "emoji-diamond": "💎",
};
utils.ADMIN_ACTIONS = {
  MAKE_MEMBER: "MAKE_MEMBER",
  FLAG_MEMBER: "FLAG_MEMBER",
  UNMAKE_MEMBER: "UNMAKE_MEMBER",
  UNFLAG_MEMBER: "UNFLAG_MEMBER",
};
utils.CAPTCHA_EXEMPT = [
  "donations_get",
  "a_donations_get",
  "qr_codes_get_platform_count",
  "locations_get_all_for_city",
  "a_users_get_balance",
  "a_users_get_data",
  "a_donations_and_saved_get_all",
  "a_qr_codes_get_all_with_stats",
  "a_withdraws_get_all",
  "a_cashouts_get_all",
  "affected_get_data_package",
  "locations_get_all",
  "a_saved_create",
  "saved_create",
];

/**
 * Returns the week number for this date.
 * https://stackoverflow.com/questions/9045868/javascript-date-getweek
 * @param  {Date} date
 * @param  {number} [dowOffset] — The day of week the week "starts" on for your locale - it can be from `0` to `6`. By default `dowOffset` is `0` (USA, Sunday). If `dowOffset` is 1 (Monday), the week returned is the ISO 8601 week number.
 * @return {number}
 */
utils.getWeek = function (date, dowOffset = 0) {
  /*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
  const newYear = new Date(date.getFullYear(), 0, 1);
  let day = newYear.getDay() - dowOffset; //the day of week the year begins on
  day = day >= 0 ? day : day + 7;
  const daynum =
    Math.floor(
      (date.getTime() -
        newYear.getTime() -
        (date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
        86400000
    ) + 1;
  //if the year starts before the middle of a week
  if (day < 4) {
    const weeknum = Math.floor((daynum + day - 1) / 7) + 1;
    if (weeknum > 52) {
      const nYear = new Date(date.getFullYear() + 1, 0, 1);
      let nday = nYear.getDay() - dowOffset;
      nday = nday >= 0 ? nday : nday + 7;
      /*if the next year starts before the middle of
        the week, it is week #1 of that year*/
      return nday < 4 ? 1 : 53;
    }
    return weeknum;
  } else {
    return Math.floor((daynum + day - 1) / 7);
  }
};

utils.getCrncy = () => {
  const storedCrncy = localStorage.getItem("crncy");
  return storedCrncy ? JSON.parse(storedCrncy) : "USD";
};

utils.getCrncySign = (crncy = null) => {
  if (crncy === null) {
    crncy = utils.getCrncy();
  }

  const sign = currencySymbols[crncy];
  if (sign) {
    return sign.symbol_native;
  } else {
    return "?";
  }
};

utils.getCrncyList = () =>
  Object.values(currencySymbols).sort((a, b) => {
    if (["GBP", "USD", "EUR", "CAD"].includes(a.code)) {
      return -1;
    } else {
      return (a.name > b.name) - (a.name < b.name);
    }
  });

utils.setCrncy = (crncy) => {
  localStorage.setItem("crncy", JSON.stringify(crncy));
};

utils.setBottomPopupState = (state) => {
  localStorage.setItem("bottomPopupState", JSON.stringify(state));
};

utils.getBottomPopupState = () => {
  const bottomPopupState = localStorage.getItem("bottomPopupState");
  return bottomPopupState ? JSON.parse(bottomPopupState) : null;
};

utils.formatBalance = (balance, subVar = null, crncy = null) => {
  const subBalance = balance && subVar ? balance[subVar] : balance;
  return balance == null
    ? "Loading"
    : utils.addZeroes(Math.floor(subBalance) / 100) +
        " " +
        utils.getCrncySign(crncy);
};

utils.formatFiatBalanceOrSmaller = (balance, crncy = null) => {
  return (
    (balance / 100 < 1 ? "<1" : utils.addZeroes(Math.floor(balance) / 100)) +
    " " +
    utils.getCrncySign(crncy)
  );
};

utils.formatBalanceIota = (balance) => {
  return utils.addZeroes(balance / utils.MI) + " MIOTA";
};

utils.formatBalanceKIota = (balance) => {
  return balance == null ? "" : utils.addZeroes(balance / utils.KI) + " KIOTA";
};

utils.formatBalanceOptional = (balance) => {
  return balance == null || balance === 0
    ? ""
    : " (" +
        parseInt(Math.floor(balance)) / 100 +
        " " +
        utils.getCrncySign() +
        ")";
};

utils.handlePassw = (passw) => {
  /*
     eight characters or more and has at least one lowercase and one uppercase alphabetical character or has at least one lowercase and one numeric character or has at least one uppercase and one numeric character. We’ve chosen to leave special characters out of this one.
     **/
  var mediumRegex = new RegExp(
    "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})"
  );
  return mediumRegex.test(passw);
};

utils.timeout = async (time) => {
  await new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, time)
  );
};

utils.makeHash = (length = 6) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

utils.hashCode = (str) => {
  if (!str) return str;

  str = str.toString().padStart(5, "0");
  let hash = 0;
  if (str.length === 0) {
    return hash.toString();
  }
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

utils.mailTo = (str) => {
  return `mailto:${utils.MAIL}?subject=${str}a` + utils.makeHash();
};

utils.formatDate = (data, field = "created_at") => {
  return !data
    ? ""
    : new Date(data[field]).toLocaleDateString() +
        " " +
        new Date(data[field]).toLocaleTimeString();
};

utils.getRootPath = (pathname) => {
  const path_arr = pathname.split("/");
  return path_arr && path_arr.length > 0 ? path_arr[1] : "";
};

utils.print = (img, printReadyCallback = {}) => {
  //var myWindow = window.open("", "Image");

  async function getPDF(img) {
    var myCanvas = document.createElement("canvas");
    document.body.appendChild(myCanvas);
    var ctx = myCanvas.getContext("2d");
    var ctximg = null;

    await new Promise((resolve, reject) => {
      ctximg = new Image();

      ctximg.onload = () => {
        ctx.drawImage(ctximg, 0, 0);
        resolve(ctx);
      };
      ctximg.src = img;
    });

    var HTML_Width = ctximg.width;

    var HTML_Height = ctximg.height;
    //var top_left_margin = 15;
    var PDF_Width = 8.27; //595//595; //HTML_Width+(top_left_margin*2);
    var PDF_Height = 11.69; //842//842; //(PDF_Width*1.5)+(top_left_margin*2);
    //var canvas_image_width = HTML_Width;
    //var canvas_image_height = HTML_Height;

    let DPI = 72;

    //hack to check for qr res
    if (HTML_Width === 2480) {
      DPI = 300;
    }

    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height / DPI) - 1;

    var imgData = img; //canvas.toDataURL("image/jpeg", 1.0);
    /*var pdf = new window.jsPDF('p', 'pt',  [PDF_Width, PDF_Height]);
        pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin,canvas_image_width,canvas_image_height);
        
        for (var i = 1; i <= totalPDFPages; i++) {
          pdf.addPage(PDF_Width, PDF_Height);
          pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height*i)+(top_left_margin*4),canvas_image_width,canvas_image_height);
        }*/

    //
    /*
        x.document.location=string;

        df.addHTML($('#content'), y, x, options, function () {
          var blob = pdf.output("blob");
          window.open(URL.createObjectURL(blob));
        });

        let pdf = new jsPDF();
        pdf.setProperties({
          title: "Report"
        });
        pdf.output('dataurlnewwindow');*/

    //HTML_Width
    //HTML_Height
    var pdf = new window.jsPDF("p", "in", [PDF_Width, PDF_Height], true); //a4
    pdf.addImage(
      imgData,
      "JPG",
      0,
      0,
      HTML_Width / DPI,
      HTML_Height / DPI,
      undefined,
      "FAST"
    );

    for (var i = 1; i < totalPDFPages; i++) {
      pdf.addPage(PDF_Width, PDF_Height);
      pdf.addImage(
        imgData,
        "JPG",
        0,
        -(PDF_Height * i),
        HTML_Width / DPI,
        HTML_Height / DPI,
        undefined,
        "FAST"
      );
    }

    pdf.save("QrCodes.pdf");
    printReadyCallback();

    document.body.removeChild(myCanvas);
  }

  //var myImage = img
  //myWindow.document.write("<img div='imgCanvas' src='"+myImage+"'>");
  getPDF(img);
  //myWindow.print();
};

utils.copyToClipboard = (str) => {
  const el = document.createElement("textarea");
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};

utils.isMobile = () => {
  const userAgent =
    typeof window.navigator === "undefined" ? "" : navigator.userAgent;
  return Boolean(
    userAgent.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    )
  );
};

utils.pdfGenerationEstimate = (qrCodeCount = 1) => {
  return qrCodeCount; //parseInt(qrCodeCount * (utils.isMobile() ? 5 : 1))
};

utils.dayDifference = (a, b) => {
  const ONE_DAY = 1000 * 60 * 60 * 24;
  return Math.round(
    Math.abs((new Date(a).getTime() - new Date(b).getTime()) / ONE_DAY)
  );
};

utils.getNumberOfWeek = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.valueOf() - firstDayOfYear.valueOf()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

utils.seperateCampaignData = (content) => {
  if (!content) return {};

  const {
    campaign_id,
    campaign_title,
    campaign_description,
    campaign_landing_address,
    campaign_img_link,
    campaign_fiat_amount,
    campaign_curr_fiat_amount,
    campaign_finished,
  } = content;

  return {
    /* campaign */
    id: campaign_id,
    title: campaign_title,
    description: campaign_description,
    landing_address: campaign_landing_address,
    img_link: campaign_img_link,
    fiat_amount: campaign_fiat_amount,
    curr_fiat_amount: campaign_curr_fiat_amount,
    finished: campaign_finished,
  };
};

utils.isWithinLastMonth = (data) => {
  var dt = new Date();

  return (
    dt - data <
    1000 /*ms*/ * 60 /*s*/ * 60 /*min*/ * 24 /*h*/ * 30 /*days*/ * 1 /*months*/
  );
};

utils.deduplicate = (x, i, a) => {
  return a.indexOf(x) === i;
};

utils.mod = (a, b) => {
  // Calculate
  return ((a % b) + b) % b;
};

utils.addZeroes = (num, null_default = 0) => {
  if (num == null) return null_default;
  //num = String(num);
  var value = Number(num);
  var res = String(num).split(".");
  if (res.length === 1 || res[1].length < 3) {
    value = value.toFixed(2);
  }
  value = Number(value);
  return value.toFixed(2);
};

utils.isLeapYear = function (str) {
  var year = str.getFullYear();
  if ((year & 3) !== 0) return false;
  return year % 100 !== 0 || year % 400 === 0;
};

// Get Day of Year
utils.getDOY = function (str) {
  var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  var mn = str.getMonth();
  var dn = str.getDate();
  var dayOfYear = dayCount[mn] + dn;
  if (mn > 1 && utils.isLeapYear(str)) dayOfYear++;
  return dayOfYear;
};

utils.getSghash = () => {
  return JSON.parse(localStorage.getItem(STORAGE_HASH));
};

utils.setSgHash = () => {
  const hash = utils.makeHash();
  localStorage.setItem(STORAGE_HASH, JSON.stringify(hash));
  return hash;
};

utils.cacheDonationData = (qr_code) => {
  let qr_codes = JSON.parse(localStorage.getItem(DONATION_DATA));
  if (!qr_codes) qr_codes = [];
  qr_codes.push(qr_code);
  localStorage.setItem(DONATION_DATA, JSON.stringify(qr_codes));
};

utils.getCachedDonationData = (id) => {
  const cachedDonationData = localStorage.getItem(DONATION_DATA);
  return !cachedDonationData ? [] : JSON.parse(cachedDonationData);
};

utils.removeCachedDonationData = () => {
  localStorage.removeItem(DONATION_DATA);
};

utils.cacheAffectedData = (affectedData) => {
  const existingAffectedData =
    JSON.parse(localStorage.getItem(AFFECTED_DATA)) || [];
  const finalAffectedDatas = new Array(
    affectedData.length +
      (existingAffectedData ? existingAffectedData.length : 0)
  );
  existingAffectedData
    .concat(affectedData || [])
    .forEach((x) => (x ? (finalAffectedDatas[x.affected_id] = x) : null)); //concat order is correct
  localStorage.setItem(AFFECTED_DATA, JSON.stringify(finalAffectedDatas));
};

utils.cacheAffectedDataLocations = (contentData, id) => {
  let existingAffectedDataLocations = JSON.parse(
    localStorage.getItem(AFFECTED_DATA_LOCATIONS)
  );
  if (!existingAffectedDataLocations) {
    existingAffectedDataLocations = [];
  }
  existingAffectedDataLocations[id] = contentData;

  localStorage.setItem(
    AFFECTED_DATA_LOCATIONS,
    JSON.stringify(existingAffectedDataLocations)
  );
};

utils.getCachedAffectedData = (id) => {
  const cachedAffectedData = localStorage.getItem(AFFECTED_DATA);
  if (!id) {
    return !cachedAffectedData ? [] : JSON.parse(cachedAffectedData);
  } else {
    return !cachedAffectedData || JSON.parse(cachedAffectedData).length <= id
      ? {}
      : JSON.parse(cachedAffectedData)[id] || {};
  }
};

utils.getCachedUsersId = () => {
  const cachedUserId = localStorage.getItem(USERS_ID);
  return !cachedUserId ? null : cachedUserId;
};

utils.setCachedUsersId = (users_id) => {
  localStorage.setItem(USERS_ID, users_id);
};

utils.clearCachedUsersId = () => {
  localStorage.removeItem(USERS_ID);
};

utils.getCachedAffectedDataLocations = (id) => {
  const cachedAffectedData = localStorage.getItem(AFFECTED_DATA_LOCATIONS);
  return !cachedAffectedData ? [] : JSON.parse(cachedAffectedData)[id];
};

utils.isMember = (accountViewData) => {
  return (
    (accountViewData.ACCOUNT_DETAILS &&
      accountViewData.ACCOUNT_DETAILS.member_state > 0) ||
    (accountViewData.ACCOUNT_SETTINGS &&
      accountViewData.ACCOUNT_SETTINGS.member_state > 0)
  );
};

utils.hasAppliedForMember = (accountViewData) => {
  return (
    (accountViewData.ACCOUNT_DETAILS &&
      accountViewData.ACCOUNT_DETAILS.membership_applied &&
      accountViewData.ACCOUNT_DETAILS.member_state < 1) ||
    (accountViewData.ACCOUNT_SETTINGS &&
      accountViewData.ACCOUNT_SETTINGS.membership_applied &&
      accountViewData.ACCOUNT_SETTINGS.member_state < 1)
  );
};

utils.removeByValues = (array, items) => {
  if (!array) {
    return [];
  }

  const newArray = [];
  for (let i in array) {
    const item = array[i];
    var index = items.indexOf(item);
    if (index === -1) {
      newArray.push(item);
    }
  }
  return newArray;
};

utils.pickRandom = (arr) => {
  return !arr ? null : arr[Math.floor(Math.random() * arr.length)];
};

/** From npm module old iota.js
 * Checks if input is correct trytes consisting of [9A-Z]; optionally validate length
 * @method isTrytes
 *
 * @param {string} trytes
 * @param {string | number} [length='1,']
 *
 * @return {boolean}
 */
utils.isTrytes = function (trytes, length) {
  if (length === void 0) {
    length = "1,";
  }
  return (
    typeof trytes === "string" &&
    new RegExp("^[9A-Z]{" + length + "}$").test(trytes)
  );
};

utils.checkQrCodeUrl = (url, captcha = null) => {
  let public_key = url;
  if (url.length > utils.HASH_LENGTH) {
    public_key = public_key.substring(public_key.lastIndexOf("/") + 1);
  }
  console.log(url);
  if (public_key.length === utils.HASH_LENGTH) {
    return public_key; //TODO will always stay that length?
  } else {
    return false;
  }
};

export default utils;
