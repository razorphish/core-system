const followerJob = require('./twitter-follower.job');

class TwitterJobLibrary {
    constructor() { }

    /**
     * @description Starts all Twitter Jobs
     * @author Antonio Marasco
     * @date 2019-07-12
     * @memberof JobLibrary
     */
    start() {
        followerJob.start();
    }
}

module.exports = new TwitterJobLibrary();