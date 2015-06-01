
var createClient = require('./swf').createClient;

/**
 * Class to make it easier to respond to activity tasks
 * @constructor
 * @param {Object} config - Object containing the taskToken from SWF
 * @param {Object} [swfClient]
 */
var ActivityTask = exports.ActivityTask = function (config, swfClient, logger) {

    this.config = config;

    this.swfClient = swfClient || createClient();
    this.logger = logger;
};

function stringify(str) {
    if(!str) {
        return "";
    }

    if (typeof str !== "string") {
        return JSON.stringify(str);
    }

    return str;
}

ActivityTask.prototype = {

    /**
     * Sends a "RespondActivityTaskCompleted" to AWS.
     * @param {Mixed} result - Result of the activity (will get stringified in JSON if not a string)
     * @param {Function} [cb] - callback
     */
    respondCompleted: function (result, cb) {

        var self = this;
        this.swfClient.respondActivityTaskCompleted({
            result: stringify(result),
            taskToken: this.config.taskToken
        }, function (err) {

            if (err) {
                self.logger.error("Error while sending RespondActivityTaskCompleted : ", err);
            }

            if (cb) {
                cb(err);
            }

        });

    },


    /**
     * Sends a "RespondActivityTaskFailed" to AWS.
     * @param {String} reason
     * @param {String} details
     * @param {Function} [cb] - callback
     */
    respondFailed: function (reason, details, cb) {

        var o = {
            "taskToken": this.config.taskToken
        };
        if (reason) {
            o.reason = reason;
        }
        if (details) {
            o.details = stringify(details);
        }

        var self = this;
        this.swfClient.respondActivityTaskFailed(o, function (err) {

            if (err) {
                self.logger.error("Error while sending RespondActivityTaskFailed : ", err);
            }

            if (cb) {
                cb(err);
            }

        });

    },

    /**
     * Sends a heartbeat to AWS. Needed for long run activity
     * @param {Mixed} heartbeat - Details of the heartbeat (will get stringified in JSON if not a string)
     * @param {Function} [cb] - callback, indicates if the activity should be cancelled
     */
    recordHeartbeat: function (heartbeat, cb) {

        var self = this
        this.swfClient.recordActivityTaskHeartbeat({
            taskToken: this.config.taskToken,
            details: stringify(heartbeat)
        }, function (err, data) {

            if (err) {
                self.logger.error("Error while sending RecordActivityTaskHeartbeat : ", err);
            }

            if (cb) {
                cb(err, data);
            }

        });
    }

};
