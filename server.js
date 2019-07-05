#!/usr/bin/env nodejs
const express = require('express');
const exphbs = require('express-handlebars');
const hbsLayouts = require('handlebars-layouts');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const database = require('./app/database/connection');
const logger = require('./lib/winston.logger');
const cron = require('./app/job/index');
const twitterPublisher = require('./app/queue/publisher/twitter/twitter-follower.publisher');
const consumer = require('./app/queue/consumer/index');
//====================================

(app = express()), (port = 3003);

class Server {
  /**
   *Creates an instance of Server.
   * @author Antonio Marasco
   * @date 2019-07-03
   * @memberof Server
   */
  constructor() {
    this.initViewEngine();
    this.initExpressMiddleWare();
    this.initCustomMiddleware();
    this.initDb();
    this.initCron();
    this.initQueue();
    this.start();
  }

  /**
   * @description Initializes all the cron jobs
   * @author Antonio Marasco
   * @date 2019-07-03
   * @memberof Server
   */
  initCron() {
    logger.debug('---===Initializing Cron===---');
    cron.start();
  }

  initDb() {
    logger.debug('---===Initializing Database===---');
    database.open(() => {
    });
  }

  initCustomMiddleware() {
    logger.debug('---===Initializing Custom Middlewaare===---');
    if (process.platform === 'win32') {
      require('readline')
        .createInterface({
          input: process.stdin,
          output: process.stdout
        })
        .on('SIGINT', () => {
          logger.debug('SIGINT: Closing MongoDB connection');
          database.close();
        });
    }

    process.on('SIGINT', () => {
      logger.debug('SIGINT: Closing MongoDB connection');
      database.close();
    });
  }

  initExpressMiddleWare() {
    logger.debug('---===Initializing Middleware===---');
    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.static(__dirname + '/public'));
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(errorhandler());

    app.use(cookieParser());

    process.on('uncaughtException', err => {
      if (err) {
        logger.error('---------========APPLICATION ERROR========---------', err);
      }
    });
  }

  /**
   * @description Initializes the queue
   * @author Antonio Marasco
   * @date 2019-07-05
   * @memberof Server
   */
  initQueue() {
    twitterPublisher.publish('Hello World');
    consumer.start();
  }

  /**
   * @description Inits View Engine of Node
   * @author Antonio Marasco
   * @date 2019-05-14
   * @memberof Server
   */
  initViewEngine() {
    logger.debug('---===Initializing View Engine===---');
    const hbs = exphbs.create({
      extname: '.hbs',
      defaultLayout: 'master'
    });
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
    hbsLayouts.register(hbs.handlebars, {});
  }

  /**======================================== */

  /**
   * @description Starts node system
   * @author Antonio Marasco
   * @date 2019-07-03
   * @memberof Server
   */
  start() {

    module.exports = app.listen(port, err => {
      // logger.debug(
      //   '[%s] Listening on http://localhost:%d',
      //   process.env.NODE_ENV,
      //   port
      // );
      logger.debug('---===Initializing COMPLETE [%s] Listening on http://localhost:%d===---',
        process.env.NODE_ENV,
        port);
    });
  }
}

var server = new Server();