// [TwitterFollowerId] Repository
const model = require('../../models/twitter/twitter-follower-id.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * [TwitterFollowerId] Repository
 * @author Antonio Marascojob
 * 
 * @class [TwitterFollowerId] Repository
 */
class TwitterFollowerIdRepository {
    /**
     * Constructor for client
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [TwitterFollowerId].repository';
    }

    /**
     * Gets all {twitterFollowerId}s
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    all(callback) {
        logger.debug(`${this._classInfo}.all()`);

        model.find({}, {

        })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.all::find`, error);
                callback(error);
            });
    }

    /**
     * Gets all {twitterFollowerId}s with details
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    allDetails(callback) {
        logger.debug(`${this._classInfo}.allDetails()`);

        model.find({})
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.allDetails::find`, error);
                callback(error);
            });
    }

    /**
     * Gets all {twitterFollowerId}s paginated
     * @param {number} [skip=10] Page number
     * @param {number} [top=10] Per Page
     * @param {requestCallback} callback Handles the response
     * @example allPaged(2, 10, (error, data) => {} )
     */
    allPaged(skip, top, callback) {
        logger.debug(`${this._classInfo}.allPaged(${skip}, ${top})`);

        model
            .find({},
                null,
                {
                    skip: skip,
                    //   select: {
                    //     password: 0
                    //   },
                    top: top,
                    sort: { dateCreated: -1 }
                }
            )
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.allPaged(${skip}, ${top})`, error);
                return callback(error, null);
            });
    }

    /**
     * Gets a {twitterFollowerId} by a application Id
     * @param {string} userId User to get {twitterFollowerId} by
     * @param {requestCallback} callback Handles the response
     * @example byUserId('userId', (error, data) => {})
     */
    byUserId(userId, callback) {
        logger.debug(`${this._classInfo}.byUserId(${userId})`);

        model.find(
            {
                userId: userId
            })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.byUserId::find`, error);
                callback(error);
            });
    }

    /**
     * Delete a {twitterFollowerId} by id
     * @param {string} id Entity Id
     * @param {requestCallback} callback Handles the response
     * @example delete('123456789', (error, data) => {})
     */
    delete(id, callback) {
        logger.debug(`${this._classInfo}.delete(${id})`);

        model.deleteOne({ _id: id })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.delete(${id})::remove`, error);
                return callback(error);
            });
    }

    /**
     * Gets a single {twitterFollowerId}
     * @param {string} id Entity id
     * @param {requestCallback} callback Handles the response
     * @example get('123456789', (error, data) => {})
     */
    get(id, callback) {
        logger.debug(`${this._classInfo}.get(${id})`);

        model.findById(
            id,
            null,
            {
                select: {
                    _id: 1,
                    userId: 1,
                    twitterUserId: 1,
                    twitterIds: 1,
                    next_cursor: 1,
                    next_cursor_str: 1,
                    previous_cursor: 1,
                    previous_cursor_str: 1,
                    dateCreated: 1,
                    dateModified: 1
                }
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.get(${id})`, error);
                return callback(error);
            })
    }

    /**
    * Gets a single {twitterFollowerId} details
    * @param {string} id Entity id
    * @param {requestCallback} callback Handles the response
    * @example get('123456789', (error, data) => {})
    */
    getDetails(id, callback) {
        logger.debug(`${this._classInfo}.getDetails(${id})`);

        model.findById(
            id,
            null,
            {
                select: {
                    _id: 1,
                    userId: 1,
                    twitterUserId: 1,
                    twitterIds: 1,
                    next_cursor: 1,
                    next_cursor_str: 1,
                    previous_cursor: 1,
                    previous_cursor_str: 1,
                    dateCreated: 1,
                    dateModified: 1
                }
            })
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
            })
            .populate({
                path: 'twitterUserId',
                select: '_id twitterId tokenId name screenName location description url payload dateCreated dateModified',
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.getDetails(${id})`, error);
                return callback(error);
            });
    }

    /**
     * Inserts a {twitterFollowerId}
     * @param {object} body Entity data
     * @param {requestCallback} callback Handles the response
     * @example insert({property: value}, (error, data) => {})
     */
    insert(body, callback) {
        logger.debug(`${this._classInfo}.insert()`, body);

        model.create(body)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.insert()::save`, error);
                callback(error);
            });
    }

    /**
     * Gets all {twitterFollowerId}
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    search(query, fieldSelect, callback) {
        logger.debug(`${this._classInfo}.all()`);

        model.find(
            query,
            fieldSelect
        )
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.all::find`, error);
                callback(error);
            });
    }

    /**
     * Updates an {twitterFollowerId}
     * @param {string} id Entity id
     * @param {object} body Entity data
     * @param {requestCallback} callback Handles the response
     * @example update('1234', {body:data}, (error, data) => {})
     */
    update(id, body, callback) {
        logger.debug(`${this._classInfo}.update(${id})`);

        model.findOneAndUpdate(
            { _id: id },
            body,
            { new: true })
            .then(data => {
                //returns result data
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.update(${id})::findOneAndUpdate`, error);
                return callback(error);
            });
    }
}

module.exports = new TwitterFollowerIdRepository();
