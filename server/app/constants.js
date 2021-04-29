module.exports = {
  DOMAIN_URL: "https://"+process.env.DOMAIN_URL,
  QR_SITE: "/q/",
  HELPA_DONATION_AMOUNT: parseInt(process.env.HELPA_DONATION_AMOUNT), //in iota
  HELPA_DONATION_ON: parseInt(process.env.HELPA_DONATION_ON),
  IOTA_DUST_OUTPUT_ALLOWANCE: 1000000,
  IOTA_MWM: 9, //TODO 10
  HELPA_DONATION_ACCOUNT: parseInt(process.env.IOTA_CHRYSALIS)
    ? process.env.HELPA_DONATION_ACCOUNT_CHRYSALIS.replace("_", " ")
    : process.env.HELPA_DONATION_ACCOUNT.replace("_", " "),
  HELPA_EMAIL_SENDER: process.env.HELPA_EMAIL_SENDER,
  API_KEY: "apiKey",
  API_KEY_DURATION: process.env.API_KEY_DURATION,
  LIMIT: 25,
  HOMEPAGE_LOCATIONS_LIMIT: parseInt(process.env.HOMEPAGE_LOCATIONS_LIMIT) || 0,
  MI: 1000000,
  DEFAULT_ERROR: "An unknown error occurred.",
  CRNCY: "USD",
  PLAUSBILITY_LOCATION_DISTANCE: parseInt(process.env.PLAUSBILITY_LOCATION_DISTANCE), //m
  PLAUSBILITY_LOCATION_MONTHS: 3, //months
  PLAUSBILITY_LOCATION_COUNT: 25, //number of place among which plausibility ratio is checked.
  PLAUSBILITY_LOCATION_RATIO: 0.3,
  LOCATION_MAP_TIMEFRAME: parseInt(process.env.LOCATION_MAP_TIMEFRAME), //days
  MAX_DESCRIPTION_INPUT: 100, //chars
  MAX_DESCRIPTION_NAME_INPUT: 20,
  MAX_MOTIVATION_INPUT: 1000,
  MAX_QR_CODES: 6,
  QR_RESOLUTION_LOW_FIXED: parseInt(process.env.QR_RESOLUTION_LOW_FIXED),
  ACCOUNT_IMGS_OPTION: parseInt(process.env.ACCOUNT_IMGS_OPTION),
  ID_TYPE: "idType",
  USERS: "users",
  USERSDATA: "usersdata",
  ADMINS: "admins",
  ADMINSDATA: "adminsdata",
  AFFECTED: "affected",
  AFFECTEDDATA: "affecteddata",
  RECURRENT_PAYMENTS: "recurrent_payments",
  QR_CODES: "qr_codes",
  DONATIONS: "donations",
  SAVED: "saved",
  CASHOUTS: "cashouts",
  WITHDRAWS: "withdraws",
  LOCATIONS: "locations",
  EDITS: "edits",
  REPORTS: "reports",
  CAMPAIGNS: "campaigns",
  CAMPAIGNS_WITHDRAWALS: "campaigns_withdrawals",
  IMGS: "imgs",
  ADMIN_ACTIONS: {
    MAKE_MEMBER: "MAKE_MEMBER",
    FLAG_MEMBER: "FLAG_MEMBER",
    UNMAKE_MEMBER: "UNMAKE_MEMBER",
    UNFLAG_MEMBER: "UNFLAG_MEMBER",
  },
};
