const {MongoClient} = require("mongodb");

const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url);

const dbname = "test";

async function add(collection_name, data) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db(dbname);
        const collection = db.collection(collection_name);
        let results;

        if (Array.isArray(data))
            results = await collection.insertMany(data);
        else
            results = await collection.insertOne(data);

        console.log(`mongodb: ${results}`)
    }
    catch(err) {
        console.log(`err`)
    }
    finally {
        await mongoClient.close();
    }
}

async function find(collection_name, id) {
    const mongoClient = new MongoClient(url);
    try {
        await mongoClient.connect();
        const db = mongoClient.db(dbname);
        const collection = db.collection(collection_name);
        let results = collection.find({})

        if(Array.isArray(data)) results = await collection.insertMany(data)
        else results = await collection.insertOne(data)

        return results;
    }catch(err) {
        console.log(err)
    } finally {
        await mongoClient.close()
    }
}

mongoClient.connect(function(err, client){

    const db = mongoClient.db("dbname");
    const collection = db.collection(collection_name);
    collection.countDocuments(function(err, result){

        if(err){
            return console.log(err);
        }
        console.log(`В коллекции users ${result} документов`);
        client.close();
    });
});


module.exports = {add};



