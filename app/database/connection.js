const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const dbConfig = require('../../lib/config.loader').databaseConfig;
const connectionString = `mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.database}${dbConfig.queryOptions}`;
const logger = require('../../lib/winston.logger');
const async = require('async');

let connection = null;

class Database {

    /**
     * @description Close the MongoDB connection
     * @author Antonio Marasco
     * @date 2019-07-12
     * @memberof Database
     */
    close() {
        connection.close(() => {
            logger.debug(
                'Mongoose default connection disconnected through app termination'
            );
            process.exit(0);
        });
    }

    /**
     * @description Drops the database
     * @author Antonio Marasco
     * @date 2019-07-12
     * @param {function} done
     * @returns 
     * @memberof Database
     */
    drop(done) {
        if (!connection) {
            return done()
        }

        // This is faster then dropping the database
        connection.db.collections((err, collections) => {
            async.each(collections, function (collection, cb) {
                if (collection.collectionName.indexOf('system') === 0) {
                    return cb()
                }
                collection.deleteOne(cb)
            }, done)
        })
    }

    /**
     * @description Mainly used for testing; Adds large documents to MongoDB
     * @author Antonio Marasco
     * @date 2019-07-12
     * @param {*} data
     * @param {function} done
     * @memberof Database
     */
    fixtures(data, done) {
        if (!connection) {
            return done(new Error('Missing database connection.'))
        }

        var names = Object.keys(data.collections)

        async.each(names, function (name, done) {
            connection.createCollection(name, function (err, collection) {
                if (err) {
                    return done(err)
                }

                //Add fields here that have an ObjectId data type (not _ids)
                data.collections[name].forEach((item, index) => {
                    if (item.userId) {
                        item.userId = new ObjectId(item.userId);
                    }
                })

                collection.insertMany(data.collections[name], done)
            })
        }, done)
    }

    /**
     * @description Gets MongoDB Connection
     * @author Antonio Marasco
     * @date 2019-07-12
     * @returns 
     * @memberof Database
     */
    getDatabase() {
        return connection;
    }

    /**
     * @description Opens MongoDB connection
     * @author Antonio Marasco
     * @date 2019-07-12
     * @param {function} done
     * @memberof Database
     */
    open(done) {
        const options = {
            user: dbConfig.username,
            pass: dbConfig.password,
            useNewUrlParser: true
        };

        mongoose.connect(
            connectionString,
            options,
            (err) => {
                if (err) {
                    logger.error('mongoose.connect() failed: ', err);
                }
            }
        );

        mongoose.set('useCreateIndex', true);

        connection = mongoose.connection;
        mongoose.Promise = global.Promise;

        mongoose.connection.on('error', (err) => {
            logger.error('Error connecting to MongoDB: ' + connectionString, err);
            done(err, false);
        });

        mongoose.connection.once('open', () => {
            logger.debug('---===Database Connection to MongoDB SUCCESS===---');
            done(null, true);
        });
    }
}

module.exports = new Database();
