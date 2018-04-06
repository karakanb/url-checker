const http = require('http');
const https = require('https');
const url = require('url');
const util = require('util');
const validUrl = require('valid-url');

module.exports = (req, res) => {
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;

  res.setHeader('Content-Type', 'application/json');
  requestValidation(query, res);

  getStatus(query.url, (response) => {
    const statusReport = {
      success: true,
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      headers: response.headers,
      host: response.req._headers.host,
      actualUrl: query.url,
    }

    res.end(JSON.stringify(statusReport));
  });
}

const requestValidation = (query, res) => {
  if (!query.url) {
    res.end(JSON.stringify({
      success: false,
      message: "No url key provided with the request."
    }));
  }

  if (!validUrl.isUri(query.url)) {
    res.end(JSON.stringify({
      success: false,
      message: "Given URL seems to be not a valid URI."
    }));
  }

  if (!validUrl.isHttpUri(query.url) && !validUrl.isHttpsUri(query.url)) {
    res.end(JSON.stringify({
      success: false,
      message: "Given URL seems to be not a valid HTTP or HTTPS url."
    }));
  }
}

const getStatus = (url, callback) => {
  const callbackCaller = (res) => { callback(res) };
  validUrl.isHttpUri(url) ? http.get(url, callbackCaller) : https.get(url, callbackCaller);
}
