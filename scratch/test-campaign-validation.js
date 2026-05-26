const { validateSync } = require('class-validator');
const { plainToInstance } = require('class-transformer');
const { CreateAdCampaignDto } = require('../apps/backend/dist/apps/backend/src/modules/advertising/application/dtos/create-ad-campaign.dto.js');

const payload = {
  "name": "kış",
  "platform": "BAZARX",
  "budget": 50,
  "adType": "SPONSORED_PRODUCT",
  "bidAmount": 0.5,
  "pricingModel": "CPC",
  "startDate": "2026-05-24",
  "targetCities": [],
  "targetDistricts": [],
  "targetSlots": [
    "CATEGORY_BANNER",
    "SEARCH_SIDEBAR"
  ],
  "negativeKeywords": [],
  "mediaUrl": "http://localhost:9002/bazarx-media/products/137abcc3-79e3-4bad-a6e2-bffb26c12e77/medium.webp"
};

const dto = plainToInstance(CreateAdCampaignDto, payload);
const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
console.log('Validation errors:', JSON.stringify(errors.map(e => ({ property: e.property, constraints: e.constraints })), null, 2));
