const amqp = require('amqplib/callback_api');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

class TwitterFollowerPublisher {
    constructor() {
        //Logging Info
        this._classInfo = '*** [TwitterFollower].publisher';
        this._queueName = 'twitter_follower'
    }

    publish(message) {
        //Connect to RabbitMQ Server
        amqp.connect('amqp://localhost', (error0, connection) => {
            logger.debug(`${this._classInfo}.follower()::Connected to RabbitMQ OK`);

            if (error0) {
                logger.error(`${this._classInfo}.follower()::RabbitMQ Connect`, error0);
                throw error0;
            }

            //Create Channel
            connection.createChannel((error1, channel) => {
                if (error1) {
                    logger.error(`${this._classInfo}.follower()::Create Channel`, error0);
                    throw error1;
                }

                logger.debug(`${this._classInfo}.follower()::Connected to RabbitMQ Channel`);
                //Create Queue of use existing
                channel.assertQueue(this._queueName, {
                    durable: false
                });

                channel.sendToQueue(this._queueName, Buffer.from(message));
                logger.debug(
                    `${this._classInfo}.sendToQueue() OK`,
                    `${message}`
                );
            });

            setTimeout(() => {
                connection.close();
                //process.exit(0);
            }, 500);
        });
    }
}

module.exports = new TwitterFollowerPublisher();