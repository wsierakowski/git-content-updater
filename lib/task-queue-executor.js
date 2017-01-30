'use strict'

/**
 * TasksQueueExecutor works in two modes that behave differently when shifting tasks:
 * 1. Callback Mode: If a callback is passed to the constructor, shifted task
 *    will be passed to that callback. The task itself will not be called and
 *    tasks can be any type of data.
 * 2. Non-Callback Mode: If a callback is not passed to the constructor, shifted
 *    task will be called.
 *
 * Constructor:
 * @param {number} tasksLimit Required. Maximum number of tasks that can be added.
 * @param {function} callback Optional. Called when new task is ready to be executed.
 */
class TaskQueueExecutor {
  constructor (tasksLimit, cb) {
    if (cb || typeof cb !== 'function') {
      throw "When using the Callback Mode, the callback provided to the constructor must be a function.";
    }
    if (!tasksLimit || typeof tasksLimit !== 'number') {
      throw "Tasks limit is required and needs to be over 0.";
    }
    this._cb = cb;
    this._tasksLimit = tasksLimit;
    this._tasks = new Array(tasksLimit);
  }

  push(task) {
    if (this._tasks.length < this._tasksLimit) {
      if (!this._cb && typeof cb !== 'function') {
        throw "When using Non-Callback mode, each task must be a function.";
      }
      this._tasks.push(task);
      if (this._tasks.length === 1) {
        this._executeTask();
      }
    } else {
      throw `Reached the limit of ${this._tasksLimit} tasks.`;
    }
  }

  shift() {
    let shiftedItem = this._tasks.shift();
    if (this._tasks.length > 0) {
      _executeTask();
    }
  }

  _executeTask() {
    if (this._cb) {
      this._cb(this._tasks[0]);
    } else {
      this._tasks[0]();
    }
  }

  get currentItem() {
    return this._tasks[0];
  }
}

module.exports = TaskQueueExecutor;
