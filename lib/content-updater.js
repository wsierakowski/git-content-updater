const pullLocally = require('./git-pull-locally');
const webHook = require('./git-webhook');
const TaskQueue = require('./task-queue-executor');

// prototyping...

// let taskQueue;
//
// pullLocally(function _onPullComplete(err, msg) {
//   if (err) throw err;
//   taskQueue = new TaskQueue(2, executeLocalPull, 2);
// });
//
// function executeLocalPull(task) {
//
// }
let firstStart = true;
const taskQueue = new TaskQueue(2, function _onNextTask(err, task) {
  pullLocally(function _onPullComplete(err, msg) {
    if (firstStart) {
      firstStart = false;
      webHook(function _onPushEvent(err, task) {
        taskQueue.push('push');
      });
    }

    taskQueue.shift();
  });
});

taskQueue.push('initial');
