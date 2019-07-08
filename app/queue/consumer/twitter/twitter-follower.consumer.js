const amqp = require('amqplib/callback_api');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

class TwitterFollowerConsumer {
    constructor() {
        //Logging Info
        this._classInfo = '*** [TwitterFollower].consumer';
        this._queueName = 'twitter_follower'
    }

    consume() {
        amqp.connect('amqp://localhost', (error0, connection) => {
            if (error0) {
                logger.error(`${this._classInfo}.consume()::RabbitMQ Connect`, error0);
                throw error0;
            }
            connection.createChannel((error1, channel) => {
                if (error1) {
                    logger.error(`${this._classInfo}.consume()::Create Channel`, error0);
                    throw error1;
                }

                logger.debug(`${this._classInfo}.consume()::Connected to RabbitMQ Channel`);
                var queue = 'twitter_follower';

                channel.assertQueue(queue, {
                    durable: false
                });

                logger.debug(
                    `${this._classInfo}.consume()::Waiting for messages`
                );
                //console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

                channel.consume(queue, (message) => {
                    //console.log(" [x] Received %s", message.content.toString());
                    logger.debug(
                        `${this._classInfo}.consume()::Received OK`,
                        `${message.content.toString()}`
                    );
                },
                    {
                        noAck: true
                    });
            });
        });
    }
}

module.exports = new TwitterFollowerConsumer();