'use strict'

/**
 * Constructor:
 * @param {function} callback Called when new task is ready to be executed
 * @param {number} tasksLimit Maximum number of tasks that can be added
 */
class TaskQueueExecutor {
  constructor (tasksLimit, cb) {
    if (!cb || typeof cb !== 'function') {
      throw "Callback function is required.";
    }
    if (!tasksLimit || typeof tasksLimit !== 'number') {
      throw "Tasks limit is required and needs to be over 0.";
    }
    this.cb = cb;
    this.tasksLimit = tasksLimit;
    this.tasks = new Array(tasksLimit);
  }

  push(task) {
    if (this.tasks.length < this.tasksLimit) {
      this.tasks.push(task);
      if (this.tasks.length === 1) {
        this.cb(this.tasks[0]);
      }
      return this.tasks.length;
    }
    return null;
  }

  shift() {
    let shiftedItem = this.tasks.shift();
    if (this.tasks.length > 0) {
      this.cb(this.tasks[0]);
    }
    return shiftedItem;
  }

  get currentItem() {
    return this.tasks[0];
  }
}
