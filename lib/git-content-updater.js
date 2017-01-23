'use strict'

// dirty prototyping for now...

const http = require('http');

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
console.log('WEBHOOK_SECRET:', WEBHOOK_SECRET);
if (!WEBHOOK_SECRET || typeof WEBHOOK_SECRET !== "string" || WEBHOOK_SECRET.length === 0) {
  throw new Error('Providing WEBHOOK_SECRET env var is required.');
}

http.createServer((req, res) => {

  console.log(`* Request received from: ${req.connection.remoteAddress}.`);

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
  if (req.headers[HEADERS.EVENT] === EVENTS.PING) {
    return res.sendStatus(200);
  }

  if (req.headers[HEADERS.EVENT] !== EVENTS.PUSH) {
    return returnError(400, `Received unexpected event: ${req.headers[HEADERS.EVENT]}.`);
  }

  var signature = crypto.createHmac('sha1', WEBHOOK_SECRET);
  hash.setEncoding('hex');

  req.pipe(signature);
  req.on('end', () => {
    hash.end();
    let calcHash = hash.read();
    console.log('Generated hash:', calcHash, 'received hash:', req.headers[HEADERS.SIGNATURE]);
    if (req.headers[HEADERS.SIGNATURE] !== 'sha1=' + calcHash) {
      return returnError(400, 'Received signature doesn\'t match the calculated signature.');
    }

    res.sendStatus(200);

    // notify successful receive of the push event
  });

}).listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`));
