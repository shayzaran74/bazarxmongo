import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../../packages/shared/shared-persistence/src/schemas/backend/user.schema.ts';
import { UserProfile } from '../../packages/shared/shared-persistence/src/schemas/backend/userProfile.schema.ts';
import { Company } from '../../packages/shared/shared-persistence/src/schemas/backend/company.schema.ts';
import { Vendor } from '../../packages/shared/shared-persistence/src/schemas/backend/vendor.schema.ts';
import { Category } from '../../packages/shared/shared-persistence/src/schemas/backend/category.schema.ts';
import { SurplusCategory } from '../../packages/shared/shared-persistence/src/schemas/backend/surplusCategory.schema.ts';

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://barterborsa:barterborsa123@localhost:27017/bazarxmongo?authSource=admin';

async function main() {
    console.log('🚀 Starting Master Seeding Process (V2 - MongoDB)...');
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Categories
        console.log('⏳ Creating Categories...');
        const category = await Category.findOneAndUpdate(
            { slug: 'electronic' },
            {
                $set: {
                    id: 'electronic',
                    name: 'Electronics',
                    slug: 'electronic',
                    isActive: true,
                    type: 'GENERAL'
                }
            },
            { upsert: true, new: true }
        );

        const surplusCategory = await SurplusCategory.findOneAndUpdate(
            { name: 'Industrial Equipment' },
            {
                $set: {
                    id: 'industrial-equipment',
                    name: 'Industrial Equipment',
                    slug: 'industrial-equipment',
                    isActive: true
                }
            },
            { upsert: true, new: true }
        );

        // 2. Users
        const userData = [
            { email: 'admin@barterborsa.com', name: 'Admin User', role: 'ADMIN' },
            { email: 'seller1@barterborsa.com', name: 'Elite Merchant 1', role: 'VENDOR' },
            { email: 'seller2@barterborsa.com', name: 'Elite Merchant 2', role: 'VENDOR' },
            { email: 'customer1@barterborsa.com', name: 'VIP Buyer 1', role: 'USER' },
            { email: 'customer2@barterborsa.com', name: 'VIP Buyer 2', role: 'USER' },
            { email: 'customer3@barterborsa.com', name: 'VIP Buyer 3', role: 'USER' },
        ];

        console.log('⏳ Seeding Users & Related Data...');
        for (const u of userData) {
            console.log(`⏳ Processing user: ${u.email}`);
            const user = await User.findOneAndUpdate(
                { email: u.email },
                {
                    $set: {
                        id: u.email, // Use email as ID for simplicity in seed
                        email: u.email,
                        password: hashedPassword,
                        role: u.role,
                        status: 'ACTIVE',
                        isEmailVerified: true,
                        referralCode: `REF-${u.email.split('@')[0].toUpperCase()}`
                    }
                },
                { upsert: true, new: true }
            );
            console.log(`✅ User created/updated: ${user.id}`);

            // Create Profile
            const [firstName, ...lastNameParts] = u.name.split(' ');
            const lastName = lastNameParts.join(' ') || '-';
            
            await UserProfile.findOneAndUpdate(
                { userId: user.id },
                {
                    $set: {
                        id: `profile-${user.id}`,
                        userId: user.id,
                        firstName,
                        lastName
                    }
                },
                { upsert: true }
            );

            // Handle Vendor/Merchant specific data
            if (u.role === 'VENDOR') {
                const companyName = `${u.name} A.Ş.`;
                const taxNumber = `TAX-${u.email.split('@')[0].toUpperCase()}`;

                const company = await Company.findOneAndUpdate(
                    { taxNumber: taxNumber },
                    {
                        $set: {
                            id: `company-${taxNumber}`,
                            name: companyName,
                            taxNumber: taxNumber,
                            status: 'APPROVED',
                            verifiedAt: new Date()
                        }
                    },
                    { upsert: true, new: true }
                );

                const vendorSlug = u.name.toLowerCase().replace(/\s+/g, '-');
                const vendor = await Vendor.findOneAndUpdate(
                    { userId: user.id },
                    {
                        $set: {
                            id: `vendor-${user.id}`,
                            userId: user.id,
                            companyId: company.id,
                            slug: vendorSlug,
                            status: 'APPROVED',
                            tier: 'ELITE',
                            vendorType: 'COMMERCE'
                        }
                    },
                    { upsert: true, new: true }
                );
                
                // You can add more vendor related data here if schemas are available
            }
        }

        console.log('\n✅ Master Seeding Completed successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        console.log('🔌 Disconnecting from MongoDB...');
        await mongoose.disconnect();
        console.log('🔌 Disconnected');
    }
}

main();
