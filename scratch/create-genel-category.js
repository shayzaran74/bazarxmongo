const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const categoriesCol = db.collection('categories');

    const id = 'cat-genel';
    const existing = await categoriesCol.findOne({ id });

    if (!existing) {
      const doc = {
        _id: id,
        id: id,
        name: 'Genel',
        slug: 'genel',
        isActive: true,
        order: 999,
        type: 'GENERAL',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await categoriesCol.insertOne(doc);
      console.log('Created Genel category in database.');
    } else {
      console.log('Genel category already exists in database.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
