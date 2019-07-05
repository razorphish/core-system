const twitterJob = require('./twitter/twitter.job');


class JobLibrary{
    constructor(){}

    start(){
        twitterJob.start();
    }
}

module.exports = new JobLibrary();