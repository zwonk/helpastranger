const {override} = require('customize-cra');
const cspHtmlWebpackPlugin = require("csp-html-webpack-plugin");

/*const cspConfigPolicy = {
    'default-src': ["https://widget-v2.smartsuppcdn.com", "https://fonts.gstatic.com/", "https://widget-v2.smartsuppcdn.com/", "https://bootstrap.smartsuppchat.com/", "https://a.tile.openstreetmap.org/", "https://b.tile.openstreetmap.org/", 
    "https://c.tile.openstreetmap.org/", "https://dev.helpastranger.net/","https://helpastranger.net/", "https://ipapi.co/json/", "https://devapi.helpastranger.net/",  "https://api.helpastranger.net/"],
    'base-uri': "'self'",
    'object-src': "'none'",
    'script-src': ["'self'", "'unsafe-inline'", "https://widget-v2.smartsuppcdn.com", "https://www.smartsuppchat.com/", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/", "https://www.recaptcha.net/recaptcha/", "https://www.gstatic.com/recaptcha/"],
    'frame-src': ["'self'", "https://www.google.com/recaptcha/", "https://recaptcha.google.com/recaptcha/", "https://www.recaptcha.net/recaptcha/"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com/"],
    'img-src': [ "'self'", "'unsafe-inline'", "https://unpkg.com/leaflet@1.0.1/dist/", "https://a.tile.openstreetmap.org/", "https://b.tile.openstreetmap.org/", 
    "https://c.tile.openstreetmap.org/","base64", "data:"],
    'font-src': ["'self'", "https://fonts.gstatic.com/"]
};*/

const cspConfigPolicy = {
    'default-src': "'none'",
    'base-uri': "'self'",
    'object-src': "'none'",
    'script-src': ["'self'"],
    'style-src': ["'self'"]
};


function addCspHtmlWebpackPlugin(config) {
    if(process.env.NODE_ENV === 'production') {
        config.plugins.push(new cspHtmlWebpackPlugin(cspConfigPolicy));
    }

    return config;
}

module.exports = {
    webpack: override(addCspHtmlWebpackPlugin),
};

/*script-src h
frame-src https://www.google.com/recaptcha/

//"'report-sample'", "'nonce-zPUGd9Hi6LE/jcyMULaEIKJTCDU'", "'unsafe-inline'", "'strict-dynamic'",  "https:", "http:", "'unsafe-eval'"
*/