const http = require('http');
const https = require('https');
const url = require('url');
const util = require('util');
const validUrl = require('valid-url');

module.exports = (req, res) => {

  // Parse the url.
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;

  // Set the request header and validate in case of invalid inputs.
  res.setHeader('Content-Type', 'application/json');
  const isValidRequest = validateRequest(query, res);
  if (!isValidRequest) {
    return;
  }

  // Get the status and return the response.
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
  }, (err) => {
    res.end(failure(err));
  });
}

/**
 * Validate the request by checking the key existance, URI and protocol checks.
 * @param {Object} query query instance that is extracted from the request. 
 * @param {Object} res Node response object.
 */
const validateRequest = (query, res) => {
  if (!query || !query.url) {
    res.end(failure("No url key provided with the request."));
    return false;
  }

  if (!validUrl.isUri(query.url)) {
    res.end(failure("Given URL seems to be not a valid URI."));
    return false;
  }

  if (!validUrl.isHttpUri(query.url) && !validUrl.isHttpsUri(query.url)) {
    res.end(failure("Given URL seems to be not a valid HTTP or HTTPS url."));
    return false;
  }

  return true;
}

/**
 * Perform an HTTP GET call to the given URL, with appropriate protocol.
 * @param {string} url
 * @param {function} callback
 */
const getStatus = (url, callback, errorCallback) => {
  const callbackCaller = (res) => { callback(res) };
  const req = validUrl.isHttpUri(url) ? http.get(url, callbackCaller) : https.get(url, callbackCaller);
  req.on('error', errorCallback);
}

/**
 * Return a JSON string with success message.
 * @param {string} message 
 */
const success = (message) => {
  return JSON.stringify({
    success: true,
    message: message
  });
}

/**
 * Return a JSON string with failure message.
 * @param {string} message 
 */
const failure = (message) => {
  return JSON.stringify({
    success: false,
    message: message
  });
}
