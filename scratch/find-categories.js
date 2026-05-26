const mongoose = require('mongoose');

async function main() {
  const uri = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const categoriesCol = db.collection('categories');
    
    // Find category with slug "electronic"
    const cat = await categoriesCol.findOne({ slug: 'electronic' });
    console.log('Electronic category:', cat);

    // Also look for "genel" exact slug
    const genelCat = await categoriesCol.findOne({ slug: 'genel' });
    console.log('Genel category:', genelCat);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

main();
