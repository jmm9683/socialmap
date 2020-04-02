import { addNewCollection, 
        getCollections, 
        getCollectionWithUser, 
        updateCollection,
        deleteCollection
} from '../controllers/collectionControllers'

const crmRoutes = (app) => {
    app.route('/collection')
        .get((req, res, next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`);
            console.log(`Request type: ${req.method}`);
            next();
        }, getCollections)
        
        // Post endpoint
        .post(addNewCollection);

    app.route('/collection/user')
        // get a specific collection
        .post(getCollectionWithUser)
        
        // updataing specific collection
        .put(updateCollection)

        // deleting a specific collection
        .delete(deleteCollection);
}

export default crmRoutes;