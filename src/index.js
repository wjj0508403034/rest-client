'use strict';

const URL = require('url');
const Https = require("https");
const Http = require("http");
const Querystring = require('querystring');
const HttpMethod = require("./http-method");
const ReqOptions = require("./req-options");


let Logger = console;

function execute(url, options, payload) {
  let httpAgent = url.protocol === "https:" ? Https : Http;

  return new Promise(function(reslove, reject) {
    const req = httpAgent.request(options, (res) => {
      let resData = [];

      Logger.info(`STATUS: ${res.statusCode}`);
      Logger.info(`HEADERS: ${JSON.stringify(res.headers)}`);

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        resData.push(chunk);
      });

      res.on('end', () => {
        let result = resData.join('');
        Logger.info(`BODY: ${result}`);
        if (result) {
          try {
            result = JSON.parse(result);
          } catch (err) {
            Logger.warn("Parse Json failed");
          }
        }
        reslove(result);
      });
    });

    req.on('error', (e) => {
      Logger.error(`Request occur error: ${e.message}`);
      reject(e);
    });

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
}

module.exports = {
  configure: function(options) {
    if (options.logger) {
      Logger = options.logger;
    }
  },

  get: function(urlString, headers) {
    let url = URL.parse(urlString);
    let reqOptions = new ReqOptions(url, HttpMethod.GET, headers);
    return execute(url, reqOptions);
  },

  post: function(urlString, payload, headers) {
    let url = URL.parse(urlString);
    let reqOptions = new ReqOptions(url, HttpMethod.POST, headers);

    let postData = null;
    if (payload) {
      postData = Querystring.stringify(payload);
      reqOptions.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    return execute(url, reqOptions, postData);
  },

  delete: function(urlString, headers) {
    let url = URL.parse(urlString);
    let reqOptions = new ReqOptions(url, HttpMethod.DELETE, headers);
    return execute(url, reqOptions);
  }
};