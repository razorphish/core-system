#!/usr/bin/env nodejs
const express = require('express'),
  exphbs = require('express-handlebars'),
  hbsHelpers = require('handlebars-helpers'),
  hbsLayouts = require('handlebars-layouts'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  errorhandler = require('errorhandler'),
  morgan = require('morgan'),
  favicon = require('serve-favicon'),
  database = require('./app/database/connection'),
  seeder = require('./app/database/seeder'),
  logger = require('./lib/winston.logger'),
  webPushConfig = require('./lib/config.loader').webPush;
//authRoutesJwt = require('./app/routes/JWT');
//Antonio
//Instantiate libraries


//====================================

(app = express()), (port = 3003);

class Server {

  constructor() {
    this.initViewEngine();
    this.initExpressMiddleWare();
    this.initCustomMiddleware();
    this.initDbSeeder();
    this.start();
  }

  start() {
    module.exports = app.listen(port, err => {
      logger.debug(
        '[%s] Listening on http://localhost:%d',
        process.env.NODE_ENV,
        port
      );
    });
  }

  initCustomMiddleware() {
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

  initDbSeeder() {
    database.open(() => {
      //Set NODE_ENV to 'development' and uncomment the following if to only run
      //the seeder when in dev mode
      //if (process.env.NODE_ENV === 'development') {
      //  seeder.init();
      //}
      seeder.init();
    });
  }

  initExpressMiddleWare() {
    app.use(favicon(__dirname + '/public/images/favicon.ico'));
    app.use(express.static(__dirname + '/public'));
    app.use(morgan('dev'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(errorhandler());

    app.use(cookieParser());
    // app.use(cookieParser({
    //   key: "mysite.sid.uid.whatever",
    //   secret: 'secret123', //**SET ENCRYPTED SECRET IN ENV process.env["SESSION_SECRET"],
    //   cookie: {
    //     maxAge: 2678400000 // 31 days
    //   },
    // }));
    // Replace line below with:
    // app.use(csrf({ cookie: false }));

    //Declare public routes BEFORE XSRF so they
    //do not need the xsrf cookie

    //app.use(csrf({ cookie: true }));

    // // UnCOMMENT WHEN SOLUTION FOUND FOR CSRF
    // app.use((req, res, next) => {
    //   if (req.method === 'OPTIONS') {
    //     console.log('Options');
    //   }
    //   var csrfToken = req.csrfToken();
    //   res.locals._csrf = csrfToken;
    //   res.cookie('XSRF-TOKEN', csrfToken);
    //   // console.log('csrf-token: ' + csrfToken);
    //   next();
    // });
    //process.setMaxListeners(0);

    process.on('uncaughtException', err => {
      if (err) {
        logger.error('---------========APPLICATION ERROR========---------', err);
      }
    });
  }


  /**
   * @description Inits View Engine of Node
   * @author Antonio Marasco
   * @date 2019-05-14
   * @memberof Server
   */
  initViewEngine() {
    const hbs = exphbs.create({
      extname: '.hbs',
      defaultLayout: 'master'
    });
    app.engine('hbs', hbs.engine);
    app.set('view engine', 'hbs');
    hbsLayouts.register(hbs.handlebars, {});
  }
}

var server = new Server();