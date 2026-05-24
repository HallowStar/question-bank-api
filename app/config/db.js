const { MongoClient, ServerApiVersion } = require("mongodb");

let client = null;

async function connectDb(mongoUri, dbName) {
  if (client) {
    return client.db(dbName);
  }

  client = new MongoClient(mongoUri, {
    serverApi: {
      version: ServerApiVersion.v1,
    },
  });

  await client.connect;

  console.log("Client Connected");

  return client.db(dbName);
}

module.exports = { connectDb };
