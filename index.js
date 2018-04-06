const https = require('https');
const url = require('url');
const util = require('util');

module.exports = (req, res) => {
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;

  res.setHeader('Content-Type', 'application/json');
  if (!query["url"]) {
    res.end(JSON.stringify({
      success: false,
      message: "No url key provided with the request."
    }));
  }

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

const getStatus = (url, callback) => {
  https.get(url, function (res) {
    callback(res);
  });
}
