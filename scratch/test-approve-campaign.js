const mongoose = require('mongoose');
const { AdCampaign: AdCampaignModel } = require('../packages/shared/shared-persistence/dist/schemas/backend/adCampaign.schema.js');
const { AdCampaignMapper } = require('../apps/backend/dist/apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.js');
const { AdCampaign } = require('../apps/backend/dist/apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.js');

const uri = "mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  try {
    const campaignId = "50b61f26-83cc-4048-9199-8c02d1f02ec8";
    console.log(`\nFinding campaign ${campaignId}...`);
    const doc = await AdCampaignModel.findOne({ id: campaignId }).exec();
    if (!doc) {
      console.log("Campaign not found in db!");
      return;
    }
    console.log("Found Document in DB:", JSON.stringify({
      id: doc.id,
      name: doc.name,
      adStatus: doc.adStatus,
      adType: doc.adType
    }, null, 2));

    // Map to Domain
    const domainEntity = AdCampaignMapper.toDomain(doc);
    console.log("Domain entity props before approve:", JSON.stringify(domainEntity.getProps(), null, 2));

    // Approve
    domainEntity.approve();
    console.log("Domain entity props after approve:", JSON.stringify(domainEntity.getProps(), null, 2));

    // Map to Persistence
    const persistence = AdCampaignMapper.toPersistence(domainEntity);
    console.log("Mapped Persistence object to save:", JSON.stringify(persistence, null, 2));

    // Save using Mongoose update
    console.log("Saving back to DB...");
    const updatedDoc = await AdCampaignModel.findOneAndUpdate({ id: campaignId }, persistence, { new: true }).exec();
    console.log("Saved Document in DB:", JSON.stringify({
      id: updatedDoc.id,
      name: updatedDoc.name,
      adStatus: updatedDoc.adStatus,
      adType: updatedDoc.adType
    }, null, 2));
    
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
