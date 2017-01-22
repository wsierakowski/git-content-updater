'use strict'

// dirty prototyping for now...

const http = require('http');

const WEBHOOK_URL = '/gitpush';
const EVENT_PUSH = 'push';
const HEADERS = {
  SIGNATURE: 'x-hub-signature',
  EVENT: 'x-github-event',
  DELIVERY: 'x-github-delivery',
};
const SECRET = 'tbd';

http.createServer((req, res) => {

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
  if (req.headers[HEADERS.EVENT] !== EVENT.PUSH) {
    return returnError(400, `Received unexpected event: ${req.headers[HEADERS.EVENT]}.`);
  }

  var signature = crypto.createHmac('sha1', SECRET);
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

}).listen(8080, () => console.log('Listening on port 8080'));
