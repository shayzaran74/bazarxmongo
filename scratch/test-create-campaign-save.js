const mongoose = require('mongoose');
const { AdCampaign: AdCampaignModel } = require('../packages/shared/shared-persistence/dist/schemas/backend/adCampaign.schema.js');
const { AdCampaignMapper } = require('../apps/backend/dist/apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.js');
const { AdCampaign } = require('../apps/backend/dist/apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.js');

const uri = "mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true";

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  const dto = {
    name: "kış",
    platform: "BAZARX",
    budget: 50,
    adType: "SPONSORED_PRODUCT",
    bidAmount: 0.5,
    pricingModel: "CPC",
    startDate: "2026-05-24",
    endDate: undefined,
    targetCities: [],
    targetDistricts: [],
    targetSlots: ["CATEGORY_BANNER"],
    targetKeywords: ["lst-1779485202819-0dd406ec", "lst-1779485202904-0299779f"],
    negativeKeywords: [],
    mediaUrl: "http://localhost:9002/bazarx-media/products/09516424-76d5-455c-b201-017f3232f99a/medium.webp"
  };

  try {
    const campaign = AdCampaign.create({
      ...dto,
      vendorId: "vendor-id-test",
      startDate: new Date(dto.startDate),
      endDate: new Date(Date.now() + 100 * 365 * 24 * 3600 * 1000),
      negativeKeywords: dto.negativeKeywords || [],
      targetCategories: [],
      targetKeywords: dto.targetKeywords || [],
      targetCities: dto.targetCities || [],
      targetDistricts: dto.targetDistricts || [],
      targetSlots: dto.targetSlots || [],
    });

    const persistence = AdCampaignMapper.toPersistence(campaign);
    console.log("Persistence object to save:", JSON.stringify(persistence, null, 2));

    const doc = new AdCampaignModel(persistence);
    await doc.save();
    console.log("Saved successfully!");
  } catch (err) {
    console.error("Error saving campaign:");
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
