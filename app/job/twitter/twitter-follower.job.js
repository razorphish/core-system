const CronJob = require('cron').CronJob;
const logger = require('../../../lib/winston.logger');
const jobRepo = require('../../database/repositories/job/job.repository');
const jobNames = require('./twitter.enum');
const async = require('async');
const moment = require('moment');
const queue = require('../../queue/twitter/publisher/twitter-follower.publisher');

class TwitterFollowerJob {
    constructor() {
        this._classInfo = '*** [Twitter].job';
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

    /**
     * @description Gets Twitter follower ids [Step 1 for follower]
     * @author Antonio Marasco
     * @date 2019-07-09
     * @memberof TwitterJob
     */
    twitterFollower() {
        // Run every fifteen minutes
        logger.debug('---===Initializing Cron: Twitter Follower===---');

        const job = new CronJob('0 */3 * * * *', () => {

            async.waterfall([
                //1. Update documents to kickoff process
                (done) => {
                    //Update documents
                    const kickoff = moment.utc();

                    let update = {
                        $set: {
                            activityStatusId: 'processing',
                            'execution.started': moment().utc()
                        }
                    }

                    let filter = {
                        activityStatusId: 'ready',
                        statusId: 'active',
                        name: jobNames.TwitterJobEnum.BY_FOLLOWER_ID,
                        'execution.kickoff': { $lte: kickoff }
                    }

                    jobRepo.updateMany(filter, update, (error, result) => {
                        if (error) {
                            logger.error(`${this._classInfo}.twitterFollower():1:updateMany`, error);
                            return done(error);
                        } else {
                            logger.debug(`${this._classInfo}.twitterFollower():1:updateMany`);
                            return done(null, result);
                        }
                    });
                },
                //2.  Get all current processing records
                (result, done) => {
                    jobRepo.byName(
                        jobNames.TwitterJobEnum.BY_FOLLOWER_ID,
                        {
                            activityStatusId: 'processing',
                            statusId: 'active'
                        },
                        (error, jobs) => {
                            if (error) {
                                logger.error(`${this._classInfo}.twitterFollower():2:byName`, error);
                                done(error);
                            } else {
                                logger.debug(`${this._classInfo}.twitterFollower():2:byName OK`);
                                done(null, jobs)
                            }
                        }
                    );
                },
                //3. Send jobs to queue for processing
                (jobs, done) => {

                    queue.publish(jobs, (error, result) => {
                        if (error) {
                            logger.error(`${this._classInfo}.twitterFollower():3:publish`, error);
                            done(error);
                        } else {
                            logger.debug(`${this._classInfo}.twitterFollower():3:publish OK`);
                            done(null, result)
                        }
                    });
                }
            ], (error, result) => {
                if (error) {
                    //Send email
                    //TODO:
                    logger.error(`${this._classInfo}.twitterFollower():ERROR`, error);
                }
                return result;
            });

        });

        job.start();
    }
}

module.exports = new TwitterFollowerJob();