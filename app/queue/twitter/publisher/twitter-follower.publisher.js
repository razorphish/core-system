const amqp = require('amqplib/callback_api');
const publishEnum = require('../enum').TwitterJobEnum;
const logger = require('../../../../lib/winston.logger');

/**
 * @description Twitter Follower mq publisher class
 * @author Antonio Marasco
 * @date 2019-07-12
 * @class TwitterFollowerPublisher
 */
class TwitterFollowerPublisher {

    /**
     *Creates an instance of TwitterFollowerPublisher.
    * @author Antonio Marasco
    * @date 2019-07-12
    * @memberof TwitterFollowerPublisher
    */
    constructor() {
        //Logging Info
        this._classInfo = '*** [TwitterFollower].publisher';

        //Queue Info
        this._queueName = publishEnum.QUEUE_FOLLOWER;
        this._exchangeName = publishEnum.EXCHANGE_FOLLOWER;
    }

    /**
     * @description Publish Twitter messages
     * @author Antonio Marasco
     * @date 2019-07-12
     * @param {*} messages
     * @param {function} done 
     * @memberof TwitterFollowerPublisher
     */
    publish(messages, done) {
        //Connect to RabbitMQ Server
        amqp.connect('amqp://localhost', (error0, connection) => {
            logger.debug(`${this._classInfo}.follower()::Connected to RabbitMQ OK`);

            if (error0) {
                logger.error(`${this._classInfo}.follower()::RabbitMQ Connect`, error0);
                return done(error);
            }

            //Create Channel
            connection.createChannel((error1, channel) => {
                if (error1) {
                    logger.error(`${this._classInfo}.follower()::Create Channel`, error0);
                    return done(error);
                }

                logger.debug(`${this._classInfo}.follower()::Connected to RabbitMQ Channel`);

                //Create/use existing queue
                channel.assertQueue(this._queueName, {
                    durable: true
                });

                //publish message to queue
                messages.forEach((message, index) => {
                    channel.sendToQueue(this._queueName, Buffer.from(JSON.stringify(message)));
                })

                logger.debug(
                    `${this._classInfo}.sendToQueue() OK`,
                    `${messages}`
                );

                done(null, { status: 'Ok' });
            });

            setTimeout(() => {
                connection.close();
                //process.exit(0);
            }, 500);
        });
    }
}

module.exports = new TwitterFollowerPublisher();