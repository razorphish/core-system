// [SubscriptionPlan] Repository
const model = require('../../models/subscription/subscription-plan.model');
const logger = require('../../../../lib/winston.logger');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {*} error
 * @param {*} data
 */

/**
 * [SubscriptionPlan] Repository
 * @author Antonio Marascojob
 * 
 * @class [SubscriptionPlan] Repository
 */
class SubscriptionPlanRepository {
    /**
     * Constructor for client
     */
    constructor() {
        //Logging Info
        this._classInfo = '*** [SubscriptionPlan].repository';
    }

    /**
     * Gets all {subscriptionPlan}s
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
     * Gets all {subscriptionPlan}s with details
     * @param {requestCallback} callback Handles the response
     * @example all((error, data) => {})
     */
    allDetails(callback) {
        logger.debug(`${this._classInfo}.allDetails()`);

        model.find({})
            .populate({
                path: 'items',
                select: '_id amount description name saleAmount typeId limit',
                populate: [
                    {
                        path: 'users',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.allDetails::find`, error);
                callback(error);
            });
    }

    /**
     * Gets all {subscriptionPlan}s paginated
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
                    sort: { lastName: 1 }
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
     * Gets a {subscriptionPlan} by a application Id
     * @param {string} applicationId Application to get {subscriptionPlan} by
     * @param {requestCallback} callback Handles the response
     * @example byApplicationId('application_id', (error, data) => {})
     */
    byApplicationId(applicationId, callback) {
        logger.debug(`${this._classInfo}.byApplicationId(${applicationId})`);

        model.find(
            {
                applicationId: applicationId
            })
            .populate({
                path: 'items',
                match: { statusId: { $eq: 'active' } },
                select: '_id amount description name saleAmount typeId limit',
                populate: [
                    {
                        path: 'users',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .then((data) => {
                callback(null, data);
            })
            .catch(error => {
                logger.error(`${this._classInfo}.byApplicationId::find`, error);
                callback(error);
            });
    }

    /**
     * Delete a {subscriptionPlan} by id
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
     * Gets a single {subscriptionPlan}
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
                    statusId: 1,
                    privacy: 1,
                    name: 1,
                    preferences: 1,
                    items: 1,
                    dateExpire: 1,
                    userId: 1
                }
            })
            .populate({
                path: 'items',
                match: { statusId: { $ne: 'deleted' } },
                select: '_id name categoryId price quantity url notes purchased purchasedBy image statusId sortOrder dateCreated'
            })
            .populate({
                path: 'follows',
                select: '_id userId endpoint expirationTime keys notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion',
                match: { statusId: { $ne: 'deleted' } }
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
    * Gets a single {subscriptionPlan} details
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
            })
            .populate({
                path: 'userId',
                select: '_id firstName lastName email username'
            })
            .populate({
                path: 'items',
                match: { statusId: { $ne: 'deleted' } },
                select: '_id userId name categoryId price quantity url notes purchased purchasedBy image statusId sortOrder dateCreated',
                populate: [
                    {
                        path: 'userId',
                        select: '_id email firstName lastName'
                    }
                ]
            })
            .populate({
                path: 'follows',
                select: '_id userId endpoint expirationTime keys notifiedOnAddItem notifiedOnRemoveItem notifiedOnCompletion statusId',
                match: { statusId: { $ne: 'deleted' } },
                populate: [
                    {
                        path: 'userId',
                        select: '_id email firstName lastName'
                    }
                ]
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
     * Inserts a {subscriptionPlan}
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
     * Gets all {subscriptionPlan}
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
     * Updates an {subscriptionPlan}
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

module.exports = new SubscriptionPlanRepository();
