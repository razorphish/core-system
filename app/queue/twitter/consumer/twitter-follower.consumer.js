const amqp = require('amqplib/callback_api');
const publishEnum = require('../enum').TwitterJobEnum;
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
        this._queueName = publishEnum.QUEUE_FOLLOWER;
        this._exchangeName = publishEnum.EXCHANGE_FOLLOWER;
    }

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

                logger.debug(`${this._classInfo}.consume()::Connected to RabbitMQ Channel`);

                channel.assertExchange(this._exchangeName, {
                    durable: false
                });

                logger.debug(
                    `${this._classInfo}.consume()::Waiting for messages`
                );

                channel.assertQueue('', {
                    exclusive: true
                }, (error2, q) => {
                    if (error2) {
                        throw error2;
                    }

                    logger.debug(
                        `${this._classInfo}.consume()::assertQueue OK`,
                        `${q.queue}`
                    );

                    //Bind the queue to exchange
                    channel.bindQueue(q.queue, this._exchangeName, '');

                    //consume the message from the queue
                    channel.consume(q.queue, (message) => {
                        //console.log(" [x] Received %s", message.content.toString());
                        logger.debug(
                            `${this._classInfo}.consume()::Received OK`,
                            `${message.content.toString()}`
                        );
                    },
                        {
                            noAck: true
                        }
                    );
                });
            });
        });
    }
}

module.exports = new TwitterFollowerConsumer();