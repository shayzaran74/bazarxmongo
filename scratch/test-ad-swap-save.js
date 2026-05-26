const mongoose = require('mongoose');
const { AdCampaign: AdCampaignModel } = require('../packages/shared/shared-persistence/dist/schemas/backend/adCampaign.schema.js');
const { AdCampaignMapper } = require('../apps/backend/dist/apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.js');
const { AdCampaign } = require('../apps/backend/dist/apps/backend/src/modules/advertising/domain/entities/ad-campaign.entity.js');

const uri = "mongodb://barterborsa:barterborsa123@127.0.0.1:27017/bazarxmongo?authSource=admin&directConnection=true";

async function testType(adType) {
  console.log(`\nTesting save for adType: ${adType}`);
  const dto = {
    name: `Test Swap Campaign - ${adType}`,
    platform: "BAZARX",
    budget: 0,
    adType: adType,
    bidAmount: 0,
    pricingModel: "CPC",
    startDate: "2026-05-24",
    endDate: undefined,
    targetCities: [],
    targetDistricts: [],
    targetSlots: ["CATEGORY_BANNER"],
    targetKeywords: ["prod-1234"],
    negativeKeywords: [],
    mediaUrl: "http://localhost:9002/bazarx-media/products/test.webp"
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
    const doc = new AdCampaignModel(persistence);
    await doc.save();
    console.log(`Saved successfully for ${adType}! ID: ${campaign.id}`);
  } catch (err) {
    console.error(`Error saving campaign for ${adType}:`, err.message);
  }
}

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");

  await testType("REWARD_DISTRIBUTION");
  await testType("SAMPLING");

  await mongoose.disconnect();
}

run();
