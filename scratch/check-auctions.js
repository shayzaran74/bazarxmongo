const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true';

const AuctionSchema = new mongoose.Schema({
  id: String,
  listingId: String,
  status: String,
  startingPrice: mongoose.Schema.Types.Decimal128,
  currentPrice: mongoose.Schema.Types.Decimal128,
  minBidIncrement: mongoose.Schema.Types.Decimal128,
  participationDeposit: mongoose.Schema.Types.Decimal128,
}, {
  collection: 'auctions',
});

const Auction = mongoose.model('Auction', AuctionSchema);

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const auctions = await Auction.find({}).lean();
  console.log('Total auctions:', auctions.length);
  auctions.forEach(a => {
    console.log({
      id: a.id,
      status: a.status,
      startingPrice: a.startingPrice?.toString(),
      currentPrice: a.currentPrice?.toString(),
      minBidIncrement: a.minBidIncrement?.toString(),
      participationDeposit: a.participationDeposit?.toString(),
    });
  });

  await mongoose.disconnect();
}

main().catch(console.error);
