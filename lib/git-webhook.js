'use strict'

// dirty prototyping for now...

const http = require('http');
const crypto = require('crypto');

const SERVER_PORT = 8080;
const WEBHOOK_URL = '/gitpush';
const EVENTS = {
  PUSH: 'push',
  PING: 'ping'
}
const HEADERS = {
  SIGNATURE: 'x-hub-signature',
  EVENT: 'x-github-event',
  DELIVERY: 'x-github-delivery',
};
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
//console.log('WEBHOOK_SECRET:', WEBHOOK_SECRET);
if (!WEBHOOK_SECRET || typeof WEBHOOK_SECRET !== 'string' || WEBHOOK_SECRET.length === 0) {
  throw new Error('Providing WEBHOOK_SECRET env var is required.');
}


// TODO externalise internal params...

/**
 * Starts webhook for GitHub
 * @param {function} callback Passes error as first param and event type as second
 */

function gitWebhook(cb) {
  http.createServer((req, res) => {
    console.log(`* Request received from: ${req.connection.remoteAddress}.`);

    let hmac = crypto.createHmac('sha1', WEBHOOK_SECRET);
    let bodyChunks = [];

    function returnError(code, msg) {
      res.writeHead(code, {'content-type': 'application/json'});
      res.end(JSON.stringify({error: msg}));
    }

    if (req.url.split('?')[0] !== WEBHOOK_URL) {
      return returnError(404, 'Not found.');
    }

    if (
      !req.headers[HEADERS.SIGNATURE] ||
      !req.headers[HEADERS.EVENT] ||
      !req.headers[HEADERS.DELIVERY]
    ) {
      return returnError(400, 'Missing required headers.');
    }

    console.log('event received: ', req.headers[HEADERS.EVENT]);

    // ping event is only sent on setting up a new webhook on GitHub
    if (
      req.headers[HEADERS.EVENT] !== EVENTS.PUSH &&
      req.headers[HEADERS.EVENT] !== EVENTS.PING
    ) {
      return returnError(400, `Received unexpected event: ${req.headers[HEADERS.EVENT]}.`);
    }

    req.on('data', chunk => {
      bodyChunks.push(chunk);
    });

    req.on('error', err => {
      console.error(err.stack);
      return returnError(400, err.stack);
    });

    req.on('end', () => {
      // TODO perhaps some simple validation would be useful like making sure
      // the event is sent for the right repository
      let reqBodyString = Buffer.concat(bodyChunks).toString();
      hmac.update(reqBodyString);
      let calcSignature = 'sha1=' + hmac.digest('hex');
      let reqBodyObj;

      console.log(
        'Generated signature:', calcSignature,
        '\nReceived signature: ', req.headers[HEADERS.SIGNATURE],
        '\nMatch: ', calcSignature === req.headers[HEADERS.SIGNATURE]
      );

      if (req.headers[HEADERS.SIGNATURE] !== calcSignature) {
        return returnError(400, 'Received signature doesn\'t match the calculated signature.');
      }

      try {
        reqBodyObj = JSON.parse(reqBodyString);
      } catch (err) {
        console.log('Req body not parsed:', err);
        return returnError(`Error parsing reqest body as JSON: ${err}.`);
      }

      getInfo(reqBodyObj);

      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('OK');

      // notify on successful receive of the push event
      if (req.headers[HEADERS.EVENT] === EVENTS.PUSH) {
        return cb(null, EVENTS.PUSH);
      }
    });

  }).listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`));
}

function getInfo(body) {
  // only for push events: var hookId = body.hook_id;
  var hcTimeStamp = body.head_commit.timestamp;
  var commitsNo = body.commits.length;
  var repoName = body.repository.full_name;
  var senderLogin = body.sender.login;
  console.log('----------WebHookEventInfo----------');
  console.log('timestamp:', hcTimeStamp);
  console.log('repoName:', repoName);
  console.log('commitsNo:', commitsNo);
  console.log('senderLogin:', senderLogin);
  console.log('------------------------------------');
}

module.exports = gitWebhook;
