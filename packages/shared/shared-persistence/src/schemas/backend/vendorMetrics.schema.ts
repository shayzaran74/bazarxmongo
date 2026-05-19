import { Schema, model, Types } from 'mongoose';

// VendorMetrics — generated from Prisma schema
// TODO: strict typing — codegen

export interface IVendorMetrics {
  _id?: string;
  id: string;
  vendorId: string;
  totalRevenue: Types.Decimal128;
  monthlyOrderCount: number;
  returnRate: Types.Decimal128;
  avgResponseTimeMins: Types.Decimal128;
  adBudgetSpent: Types.Decimal128;
  lastCalculatedAt: Date;
}

export const VendorMetricsSchema = new Schema<IVendorMetrics>({
  _id: { type: String },
  id: { type: String, required: true },
  vendorId: { type: String, alias: 'vendor_id' },
  totalRevenue: { type: Types.Decimal128, default: 0, alias: 'total_revenue' },
  monthlyOrderCount: { type: Number, default: 0, alias: 'monthly_order_count' },
  returnRate: { type: Types.Decimal128, default: 0, alias: 'return_rate' },
  avgResponseTimeMins: { type: Types.Decimal128, default: 0, alias: 'avg_response_time_mins' },
  adBudgetSpent: { type: Types.Decimal128, default: 0, alias: 'ad_budget_spent' },
  lastCalculatedAt: { type: Date, alias: 'last_calculated_at' },
}, {
  timestamps: true,
  collection: 'vendor_metrics',
});

export const VendorMetrics = model<IVendorMetrics>('VendorMetrics', VendorMetricsSchema);
