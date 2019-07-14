const twitterFollowerWorker = require('./worker/twitter-follower.worker');

class TwitterConsumer {
    constructor() {
        this._classInfo = '***[Consumer].index';
    }

    start() {
        twitterFollowerWorker.consume();
    }
}

module.exports = new TwitterConsumer();