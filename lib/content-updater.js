const pullLocally = require('./git-pull-locally');
const webHook = require('./git-webhook');
const TaskQueue = require('./task-queue-executor');

// prototyping...

// If there are multiple pushes one after another then there is no point in
// executing them one by one, only finish the current process and then pull
// again to get the latest. Hence the queue can only take 2 items, the first one
// is currently being pulled, the second is the next pull.
const taskQueue = new TaskQueue(2);
pullLocally(function _onFirstPullComplete(err, msg) {
  if (err) throw `Initial Local Pull error ${err}.`;
  console.log('** Initial Local Pull complete.');
  webHook(function _onPushEvent(err, eventType) {
    if (err) throw `Git WebHook error: ${err}.`;
    console.log('** Push Event detected.');
    taskQueue.push(function _pullLocally() {
      pullLocally(function _onPullComplete(err, msg) {
        if (err) throw `Local Pull error: ${err}.`;
        console.log('** Local Pull complete.');
        taskQueue.shift();
      });
    });
  });
});
