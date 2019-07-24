const amqp = require('amqplib/callback_api');
const publishEnum = require('../enum').TwitterQueueEnum;
const logger = require('../../../../lib/winston.logger');
const twitterLib = require('../../../../lib/twitterLibrary').twitter;
const moment = require('moment');
const jobRepo = require('../../../database/repositories/job/job.repository');
const async = require('async');

class TwitterFollowerWorker {

    /**
     *Creates an instance of TwitterFollowerWorker.
     * @author Antonio Marasco
     * @date 2019-07-12
     * @memberof TwitterFollowerWorker
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [TwitterFollower].consumer';
        this._queueName = publishEnum.QUEUE_FOLLOWER;
        this._exchangeName = publishEnum.EXCHANGE_FOLLOWER;
    }

    /**
     * @description
     * @author Antonio Marasco
     * @date 2019-07-12
     * @memberof TwitterFollowerWorker
     */
    consume() {
        amqp.connect('amqp://localhost', (error0, connection) => {
            if (error0) {
                logger.error(`${this._classInfo}.consume()::RabbitMQ Connect`, error0);
                throw error0;
            }

            //Create Channel
            connection.createChannel((error1, channel) => {
                if (error1) {
                    logger.error(`${this._classInfo}.consume()::Create Channel`, error0);
                    throw error1;
                }

                //Create/use queue
                channel.assertQueue(this._queueName, {
                    durable: true
                });

                //Tell RabbitMQ to dispatch one message at a time
                //and get other once we are ready [ack]
                channel.prefetch(1);

                //Wait for messages
                channel.consume(this._queueName, (message) => {

                    const _message = JSON.parse(message.content);
                    const _meta = JSON.parse(_message.meta);
                    let limitReached = false;
                    let limitResetsInSeconds = 0;

                    //Since we are only seeing ids lets get max count
                    let params = {
                        user_id: _meta.user_id, //Twitter User Id [Not UserId]
                        stringify_ids: true,
                        count: 5000
                    }

                    async.doUntil(
                        // iteratee
                        (next) => {
                            if (!!_meta.next_cursor && meta.next_cursor > 0) {
                                params.cursor = _meta.next_cursor;
                            }

                            async.waterfall([
                                (done) => {
                                    twitterLib.getFollowersIds(params,
                                        (error, response, body) => {
                                            logger.error(`${this._classInfo}.consume():twitter:getFollowerIds`, error);
                                            //Mark current job as fail
                                            jobRepo.update(message._id, { $set: { activityStatusId: 'fail' } });
                                            done(error);
                                        },
                                        (body, limits) => {
                                            done(null, body, limits);
                                        },
                                        _meta.accessToken,
                                        _meta.accessTokenSecret
                                    )
                                },
                                // 2. Insert result from twitter into db
                                (body, limits, done) => {

                                },
                                // check limits and create cron, if applicable
                                (limits, done) => {
                                    _meta.next_cursor = body.next_cursor;
                                    limitReached = limits['x-rate-limit-remaining'] !== 0 || _meta.next_cursor === 0;
                                    limitResetsInSeconds = limits['x-rate-limit-reset'];

                                    //Get next possible execution time
                                    let resetTime = moment().utc().add(limitResetsInSeconds, 'seconds');

                                    //Determine if more is needed
                                    if (limitReached && _meta.next_cursor > 0) {

                                        //Save to cron job
                                        //parentJobId : message._id,
                                        //userId : message.userId,
                                        //activityStatusId : 'ready'
                                        //execution['kickoff'] : resetTime,
                                        //meta : _meta,
                                        //statusId: 'active'

                                    } else {
                                        return done(null, limits);
                                    }
                                },
                                //Check of limit reached and update current job
                                (limits, done) => {
                                    //_meta.next_cursor = body.next_cursor;
                                    //limitReached = limits['x-rate-limit-remaining'] !== 0 || _meta.next_cursor === 0;

                                    //Determine if more is needed
                                    if (limitReached && _meta.next_cursor > 0) {
                                        //Mark current job complete
                                        jobRepo.update(message._id, {
                                            $set: {
                                                activityStatusId: 'completed',
                                                'execution.completed': moment().utc()
                                            }
                                        });
                                    } else {
                                        return done(limitReached);
                                    }
                                },
                                //Set next time to call and start process all over
                                (limitReached, done) => {
                                    if (limitReached) {

                                    }

                                    return done(null, limitReached);

                                },
                                // Set cron for phase 2 of job sequence
                                (limitReached, done) => {
                                    if (limitReached) {
                                        //Create cron for phase two
                                    }
                                    
                                }
                            ],
                                (error, results) => {
                                    if (error) {
                                        
                                    }
                                    next(results);
                                });

                        },
                        // test
                        (limitReached) => {
                            return limitReached
                        },
                        // callback
                        (finalResults) => {

                        }
                    )

                    logger.debug(
                        `${this._classInfo}.consume()::Received OK`,
                        `${message.content.toString()}`
                    );

                    //Acknowledge that we have received and processed message
                    //This will send next message if exists
                    channel.ack(message);
                }, {
                        // manual acknowledgment mode,
                        // see https://www.rabbitmq.com/confirms.html for detail
                        noAck: false
                    });

            });
        });
    }
}

module.exports = new TwitterFollowerWorker();