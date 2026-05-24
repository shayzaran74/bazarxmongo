const { validateSync } = require('class-validator');
const { plainToInstance } = require('class-transformer');
const { UpdateProfileDto } = require('../../packages/domain-identity/dist/dtos/update-profile.dto.js');
const { SurplusCreateDto } = require('./dist/modules/barter/application/dtos/surplus.dto.js');

const profilePayload = {
    firstName: 'Test', lastName: 'User', phoneNumber: '123456789', city: 'Istanbul', district: 'Besiktas', gender: 'male',
    companyName: 'Test Corp', taxNumber: '123', taxOffice: 'Test'
};

const profileDto = plainToInstance(UpdateProfileDto, profilePayload);
const profileErrors = validateSync(profileDto, { whitelist: true, forbidNonWhitelisted: true });
console.log('Profile errors:', JSON.stringify(profileErrors.map(e => ({ property: e.property, constraints: e.constraints })), null, 2));

const surplusPayload = {
    title: 'Test',
    description: 'Test desc',
    categoryId: 'cat1',
    category: 'cat1',
    quantity: 1,
    unit: 'KG',
    unitPrice: 10,
    images: [],
    city: 'ISTANBUL',
    materialType: 'type1',
    location: 'loc1',
    technicalSpecs: {},
    tradeModes: ['barter'],
    wantedCategories: []
};

const surplusDto = plainToInstance(SurplusCreateDto, surplusPayload);
const surplusErrors = validateSync(surplusDto, { whitelist: true, forbidNonWhitelisted: true });
console.log('Surplus errors:', JSON.stringify(surplusErrors.map(e => ({ property: e.property, constraints: e.constraints })), null, 2));
