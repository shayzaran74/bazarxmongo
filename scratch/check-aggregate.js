const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('bazarxmongo');
  const pipeline = [
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'listings',
        localField: 'id',
        foreignField: 'catalogProductId',
        as: 'listings'
      }
    }
  ];
  const items = await db.collection('catalog_products').aggregate(pipeline).toArray();
  console.log("Aggregate items:", JSON.stringify(items, null, 2));
  await client.close();
}
run().catch(console.error);
