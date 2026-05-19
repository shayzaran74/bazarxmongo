const mongoose = require('mongoose');

const uri = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';

async function run() {
  try {
    await mongoose.connect(uri);
    
    const QuadCards = mongoose.connection.db.collection('home_quad_cards');
    
    // Update all cards without platform to 'BAZARX'
    const updateResult = await QuadCards.updateMany(
      { platform: { $exists: false } },
      { $set: { platform: 'BAZARX' } }
    );
    console.log('Update platform result:', updateResult);
    
    // Also, let's make sure if there is any card with platform set to something else, or if we want to ensure all are BAZARX
    const updateResultAll = await QuadCards.updateMany(
      {},
      { $set: { platform: 'BAZARX' } }
    );
    console.log('Ensure all platform result:', updateResultAll);
    
    const allCards = await QuadCards.find({}).toArray();
    console.log('Updated home_quad_cards records:', allCards);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
