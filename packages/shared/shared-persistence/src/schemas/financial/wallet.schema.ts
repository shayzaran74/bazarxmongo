import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const WalletType = ['CASH','BARTER','XP_ADS','XP_COMMISSION','XP_TRADE'] as const;
export type WalletTypeType = typeof WalletType[number];

export interface IWallet {
  _id?: string;
  id: string;
  balanceTL: Types.Decimal128;
  barterBalance: Types.Decimal128;
  lastXpAdsEarnedDate?: Date;
  userId: string;
  xpAdsBalance: Types.Decimal128;
  xpCommissionBalance: Types.Decimal128;
  xpPoints: number;
  xpTradeBalance: Types.Decimal128;
}

export const WalletSchema = new Schema<IWallet>({
  _id: { type: String },
  id: { type: String, required: true },
  balanceTL: { type: Types.Decimal128, default: 0 },
  barterBalance: { type: Types.Decimal128, default: 0 },
  lastXpAdsEarnedDate: { type: Date },
  userId: { type: String },
  xpAdsBalance: { type: Types.Decimal128, default: 0 },
  xpCommissionBalance: { type: Types.Decimal128, default: 0 },
  xpPoints: { type: Number, default: 0 },
  xpTradeBalance: { type: Types.Decimal128, default: 0 },
}, {
  timestamps: true,
  collection: 'wallets',
});

WalletSchema.index({ userId: 1 }, { unique: true });
WalletSchema.index({ balanceTL: 1 });

export const Wallet = createModelProxy<IWallet>('Wallet', WalletSchema);