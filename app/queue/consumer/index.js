const twitterFollowerConsumer = require('./twitter/twitter-follower.consumer');

class Consumer {
    constructor() {
        this._classInfo = '***[Consumer].index';
    }

    start() {
        twitterFollowerConsumer.consume();
    }
}

module.exports = new Consumer();