const twitterJob = require('./twitter/twitter.job');

class JobLibrary {
    constructor() { }

    /**
     * @description Starts all Jobs
     * @author Antonio Marasco
     * @date 2019-07-12
     * @memberof JobLibrary
     */
    start() {
        twitterJob.start();
    }
}

module.exports = new JobLibrary();