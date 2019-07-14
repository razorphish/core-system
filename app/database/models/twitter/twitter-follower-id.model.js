const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TwitterFollowerIdSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    twitterUserId: { type: Schema.Types.ObjectId, ref: 'TwitterUser', required: false },
    twitterIds: { type: [Number], required: true },
    next_cursor: { type: Number, required: true },
    next_cursor_str: { type: String, required: true, trim: true },
    previous_cursor: { type: Number, required: true },
    previous_cursor_str: { type: String, required: true, trim: true },
    dateCreated: { type: Date, required: true, default: Date.now },
    dateModified: { type: Date, required: true, default: Date.now }
});

TwitterFollowerIdSchema.pre('save', function (next) {
    if (this.dateModified) {
        this.dateModified = new Date();
    }
    next();
});

module.exports = mongoose.model('TwitterFollowerId', TwitterFollowerIdSchema, 'twitterFollowerIds');
