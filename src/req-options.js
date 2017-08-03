'use strict';

function ReqOptions(url, method, headers) {
  return {
    hostname: url.hostname,
    port: url.port,
    path: url.path,
    method: method,
    rejectUnauthorized: false,
    headers: headers || {}
  };
}

module.exports = ReqOptions;