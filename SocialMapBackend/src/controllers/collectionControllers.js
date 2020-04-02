import mongoose from 'mongoose';
import { CollectionSchema } from '../models/collectionModel';

const Collection = mongoose.model('Collection', CollectionSchema);

export const addNewCollection = (req, res) => {
    let newCollection = new Collection(req.body);

    newCollection.save((err, collection) => {
        if (err){
            res.send(err);
        }
        res.json(collection);
    });
}

export const getCollections = (req, res) => {
    Collection.find({}, (err, collection) => {
        if (err){
            res.send(err);
        }
        res.json(collection);
    });
}

export const getCollectionWithUser = (req, res) => {
    Collection.findOne({user: req.body.user}, (err, collection) => {
        if (err){
            res.send(err);
        }
        res.json(collection);
    });
}

export const updateCollection = (req, res) => {
    Collection.findOneAndUpdate({user: req.body.user}, req.body, { new: true, useFindAndModify: false }, (err, collection) => {
        if (err){
            res.send(err);
        }
        res.json(collection);
    });
}

export const deleteCollection = (req, res) => {
    Collection.remove({user: req.body.user}, req.body, (err, collection) => {
        if (err){
            res.send(err);
        }
        res.json({ message: 'successfully deleted collection' });
    });
}