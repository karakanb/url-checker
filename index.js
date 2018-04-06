const https = require('https');
const url = require('url');
const util = require('util');

module.exports = (req, res) => {
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;

  getStatus(query.url, (response) => {
    const statusReport = {
      statusCode: response.statusCode,
      statusMessage: response.statusMessage,
      headers: response.headers,
      host: response.req._headers.host,
      actualUrl: query.url,
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(statusReport));
  });
}

const getStatus = (url, callback) => {
  https.get(url, function (res) {
    callback(res);
  });
}
