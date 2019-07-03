const CronJob = require('cron').CronJob;

class CronLibrary {
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

        const job = new CronJob('0 */15 * * * *', () => {

        });

        job.start();
    }
}

module.exports = new CronLibrary();