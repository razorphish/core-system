const amqp = require('amqplib/callback_api');
const publishEnum = require('../enum').TwitterJobEnum;
const logger = require('../../../lib/winston.logger');

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

        //Queue Info
        this._queueName = publishEnum.QUEUE_FOLLOWER;
        this._exchangeName = publishEnum.EXCHANGE_FOLLOWER;
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

                //Create exchange
                channel.assertExchange(this._exchangeName, {
                    durable: false
                });

                //publish message to exchange
                channel.publish(this._exchangeName, '', Buffer.from(message));

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