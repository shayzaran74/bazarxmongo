// packages/shared/shared-persistence/src/mongodb/mongo-decimal-assert.ts
// Decimal128 tip doğrulama — para alanları için Number sızmasını önler
// Seed sonrası ve health check'te çalıştırılır

import { Types } from 'mongoose';

// Para alanı registry'si — monetary-fields.ts'den import edilir
// Format: { collection: string, field: string }[]
export interface MonetaryFieldRegistry {
  collection: string;
  field: string;
}

// Registry'yi dışarıdan set edebilmek için singleton
let registry: MonetaryFieldRegistry[] = [];

export function setMonetaryFieldRegistry(fields: MonetaryFieldRegistry[]): void {
  registry = fields;
}

export function getMonetaryFieldRegistry(): MonetaryFieldRegistry[] {
  return registry;
}

// Decimal128 tip kontrolü
export function isDecimal128(value: unknown): value is Types.Decimal128 {
  return (
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    (value as any)._bsontype === 'Decimal128'
  );
}

// Dokümandaki para alanlarını kontrol et
export function assertDocumentMonetaryFields(
  doc: Record<string, unknown>,
  collectionName: string
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  const fields = registry.filter(f => f.collection === collectionName);

  for (const field of fields) {
    const value = doc[field.field];
    if (value !== undefined && value !== null && !isDecimal128(value)) {
      violations.push(
        `${collectionName}.${field.field}: expected Decimal128, got ${typeof value}`
      );
    }
  }

  return { valid: violations.length === 0, violations };
}

// Health check için — tüm monetary field'ları tarar
export async function assertAllMonetaryFields(
  db: import('mongoose').Connection
): Promise<{ valid: boolean; results: Array<{ collection: string; errors: string[] }> }> {
  const results: Array<{ collection: string; errors: string[] }> = [];

  for (const { collection, field } of registry) {
    try {
      const model = db.models[collection] || db.model(collection);
      const sample = await model.findOne({}, { [field]: 1 }).lean() as Record<string, unknown> | null;
      if (sample && sample[field] !== undefined && !isDecimal128(sample[field])) {
        results.push({
          collection,
          errors: [`${field}: expected Decimal128, got ${typeof sample[field]}`],
        });
      }
    } catch {
      // Model yoksa atla
    }
  }

  return { valid: results.length === 0, results };
}

// Decimal128 → string human-readable çeviri (Compass debug için)
export function decimal128ToString(value: Types.Decimal128): string {
  return value.toString();
}

// Number sızması varsa yakala (seed sonrası)
export function detectNumberSiphon(doc: Record<string, unknown>): string[] {
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(doc)) {
    if (typeof value === 'number' && (key.toLowerCase().includes('amount') ||
        key.toLowerCase().includes('balance') ||
        key.toLowerCase().includes('price') ||
        key.toLowerCase().includes('total') ||
        key.toLowerCase().includes('fee') ||
        key.toLowerCase().includes('commission'))) {
      warnings.push(`${key}: number detected (${value}) — use Decimal128`);
    }
  }
  return warnings;
}