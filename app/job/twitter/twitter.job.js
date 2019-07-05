const CronJob = require('cron').CronJob;
const logger = require('../../../lib/winston.logger');

class TwitterJob {
    constructor() {

    }

    /**
     * @description Run all default scheduled jobs
     * @author Antonio Marasco
     * @date 2019-07-02
     * @memberof CronLibrary
     */
    start() {
        this.twitterFollower();
    };

    twitterFollower() {
        // Run every fifteen minutes
        logger.debug('---===Initializing Cron: Twitter Follower===---');

        const job = new CronJob('0 */1 * * * *', () => {
            const d = new Date();

            logger.debug('TWITTER FOLLOWER JOB RUNNING', d);
        });

        job.start();
    }
}

module.exports = new TwitterJob();