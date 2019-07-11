const twitterFollowerConsumer = require('./consumer/twitter-follower.consumer');

class Consumer {
    constructor() {
        this._classInfo = '***[Consumer].index';
    }

    start() {
        twitterFollowerConsumer.consume();
    }
}

module.exports = new Consumer();