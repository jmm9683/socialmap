import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export const CollectionSchema = new Schema({
    markerCollection: [{type: Object}],
    collectionNames: [{type: String}],
    user: {type: String}
});