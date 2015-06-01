var util = require('util'),
    ActivityTask = require('./activity-task').ActivityTask,
    Poller = require('./poller').Poller;

/**
 * Polls Amazon SWF for new Activity Tasks
 * @constructor
 * @param {Object} config Ex: { domain: "my-domain", taskList: {name: "my-taskList"} }
 * @param {Object} [swfClient]
 * @augments Poller
 * @fires ActivityPoller#activityTask
 * @fires Poller#poll
 * @fires Poller#error
 */
var ActivityPoller = exports.ActivityPoller = function (config, swfClient, logger) {

    this.logger = logger || console;
    Poller.apply(this, arguments);

    if (!config.domain || !config.taskList || !config.taskList.name) {
        throw new Error("ActivityPoller: domain and taskList must be set");
    }

    // For the Poller class
    this.pollMethod = "pollForActivityTask";

};

util.inherits(ActivityPoller, Poller);



ActivityPoller.prototype._onNewTask = function(result) {
    var activityTask = new ActivityTask(result, this.swfClient, this.logger);

    /**
     * Emitted for every activity task received from Amazon SWF
     *
     * @event ActivityPoller#activityTask
     * @property {ActivityTask} activityTask
     */
    this.emit('activityTask', activityTask);
};
