const { MongoClient, ServerApiVersion } = require("mongodb");

let client = null;

async function connectDb(mongoUri, dbName) {
  if (client) {
    return client.db(dbName);
  }

  try {
    client = new MongoClient(mongoUri, {
      serverApi: {
        version: ServerApiVersion.v1,
      },
    });

    await client.connect;

    console.log("MongoDB Connected");

    return client.db(dbName);
  } catch (error) {
    console.error("MongoDB not connected");
  }
}

module.exports = { connectDb };
