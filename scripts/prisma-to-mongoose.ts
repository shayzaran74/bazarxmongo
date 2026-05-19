// scripts/prisma-to-mongoose.ts
// Prisma schema → Mongoose schema skeleton çevirici
// Kullanım: npx ts-node scripts/prisma-to-mongoose.ts --schema apps/backend/prisma/schema.prisma --out packages/shared/shared-persistence/src/schemas/backend

/**
 * Bu script Prisma schema dosyasını SATIR BAZINDA parse eder.
 * Harici bağımlılık gerektirmez — native string matching ile çalışır.
 * Deterministik, test edilebilir.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Field {
  name: string;
  type: string;
  isOptional: boolean;
  isList: boolean;
  default?: string;
  hasId: boolean;
  map?: string;
  isRelation: boolean;
  relationInfo?: string;
}

interface Model {
  name: string;
  fields: Field[];
  indexes: string[];
  mapName: string;
  uniqueConstraints: string[];
}

interface Enum {
  name: string;
  values: string[];
}

// Prisma → Mongoose tip eşleme (§1a tip eşleme tablosu)
function mapType(prismaType: string): string {
  if (prismaType === 'Decimal') return 'Types.Decimal128';
  if (prismaType === 'DateTime') return 'Date';
  if (prismaType === 'Int' || prismaType === 'Float' || prismaType === 'Double') return 'number';
  if (prismaType === 'Boolean' || prismaType === 'String') return prismaType;
  if (prismaType === 'Json') return 'Schema.Types.Mixed';
  // Array []
  if (prismaType === 'String[]' || prismaType === 'Int[]') return 'String[]';
  // Decimal[] → Decimal128[]
  if (prismaType === 'Decimal[]') return 'Types.Decimal128[]';
  return 'String';
}

// Satırları parse et
function parseLines(lines: string[]): { models: Model[], enums: Enum[] } {
  const models: Model[] = [];
  const enums: Enum[] = [];
  let currentModel: Model | null = null;
  let currentFields: Field[] = [];
  let currentIndexes: string[] = [];
  let currentUniques: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;

    // Generator / datasource — atla
    if (line.startsWith('generator') || line.startsWith('datasource')) continue;

    // Enum tanımı
    const enumMatch = line.match(/^enum\s+(\w+)\s*\{(.+)\}$/);
    if (enumMatch) {
      const values = enumMatch[2].split(/\s+/).filter(v => v.length > 0);
      enums.push({ name: enumMatch[1], values });
      continue;
    }

    // Model başı
    const modelMatch = line.match(/^model\s+(\w+)\s*\{$/);
    if (modelMatch) {
      if (currentModel) {
        // Önceki modeli kaydet
        models.push({
          name: currentModel.name,
          fields: currentFields,
          indexes: currentIndexes,
          mapName: currentModel.mapName,
          uniqueConstraints: currentUniques,
        });
      }
      currentModel = { name: modelMatch[1], fields: [], indexes: [], mapName: '', uniqueConstraints: [] };
      currentFields = [];
      currentIndexes = [];
      currentUniques = [];
      continue;
    }

    // Model sonu
    if (line === '}') {
      if (currentModel) {
        models.push({
          name: currentModel.name,
          fields: currentFields,
          indexes: currentIndexes,
          mapName: currentModel.mapName,
          uniqueConstraints: currentUniques,
        });
        currentModel = null;
      }
      continue;
    }

    // @@index
    if (line.startsWith('@@index')) {
      currentIndexes.push(line);
      continue;
    }

    // @@unique
    if (line.startsWith('@@unique')) {
      currentUniques.push(line);
      continue;
    }

    // Field parse — örn: `id String @id @default(cuid()) @map("my_id")`
    const fieldMatch = line.match(/^(\w+)\s+(String|Int|Float|Double|Decimal|Boolean|DateTime|Json)(\??)(\s+(@.*))?$/);
    if (fieldMatch && currentModel) {
      const name = fieldMatch[1];
      const prismaType = fieldMatch[2];
      const isOptional = fieldMatch[3] === '?';
      const annotations = fieldMatch[4] || '';

      // @relation — FK olarak String ID
      const hasRelation = annotations.includes('@relation');
      // @id
      const hasId = annotations.includes('@id') || name === 'id';
      // @default
      const defaultMatch = annotations.match(/@default\(([^)]+)\)/);
      const defaultValue = defaultMatch ? defaultMatch[1] : undefined;
      // @map
      const mapMatch = annotations.match(/@map\("([^"]+)"\)/);
      const mapValue = mapMatch ? mapMatch[1] : undefined;
      // Array
      const isList = annotations.includes('[]') || prismaType.includes('[]');

      currentFields.push({
        name,
        type: hasRelation ? 'String' : mapType(prismaType),
        isOptional,
        isList,
        default: defaultValue,
        hasId,
        map: mapValue,
        isRelation: hasRelation,
        relationInfo: hasRelation ? annotations.match(/@relation\([^)]+\)/)?.[0] : undefined,
      });
      continue;
    }

    // Model map name (@@map)
    if (line.startsWith('@@map') && currentModel) {
      const mapMatch = line.match(/@@map\("([^"]+)"\)/);
      if (mapMatch) {
        currentModel.mapName = mapMatch[1];
      }
    }
  }

  return { models, enums };
}

// Mongoose schema skeleton üret
function generateMongooseSchema(model: Model, enums: Enum[]): string {
  const lines: string[] = [];

  lines.push(`import { Schema, model, Types } from 'mongoose';`);
  lines.push('');
  lines.push(`// ${model.name} — generated from Prisma schema`);
  lines.push(`// TODO: strict typing — codegen`);
  lines.push('');

  lines.push(`export interface I${model.name} {`);

  for (const field of model.fields) {
    const optionalMark = field.isOptional ? '?' : '';
    let typeStr = field.isList ? `${field.type.replace('[]', '')}[]` : field.type;
    // Use lowercase primitive types
    typeStr = typeStr.replace(/String/g, 'string').replace(/Boolean/g, 'boolean').replace(/Number/g, 'number');
    lines.push(`  ${field.name}${optionalMark}: ${typeStr};`);
  }

  lines.push(`}`);
  lines.push('');

  // Schema definition
  lines.push(`export const ${model.name}Schema = new Schema<I${model.name}>({`);

  for (const field of model.fields) {
    let line = `  ${field.name}`;

    // Field type + optional
    let innerType = field.isList ? field.type.replace('[]', '') : field.type;
    // Schema'da type için Number (constructor), interface'te number (tip)
    const schemaType = innerType === 'number' ? 'Number' : innerType;
    line += `: { type: ${schemaType}`;

    // Default
    if (field.default) {
      if (field.default === 'now()') {
        line += ', default: Date.now';
      } else if (field.default === 'cuid()' || field.hasId) {
        // cuid üretimi uygulama katmanında yapılır — burada sadece required işaretle
        line += ', required: true';
      } else if (field.default.startsWith('db.')) {
        // @db.Column gibi DB-specific — skip
      } else if (field.default.startsWith('"')) {
        line += `, default: ${field.default.replace(/"/g, "'")}`;
      } else if (!isNaN(Number(field.default))) {
        line += `, default: ${field.default}`;
      } else if (field.default === 'true' || field.default === 'false') {
        line += `, default: ${field.default}`;
      }
    }

    // Map name
    if (field.map && field.map !== field.name) {
      line += `, alias: '${field.map}'`;
    }

    line += ' },';

    // Optional
    if (field.isOptional) {
      line = line.replace(': { type:', ': { type:');
    }

    lines.push(line);
  }

  lines.push(`}, {`);
  lines.push(`  timestamps: true,`);
  if (model.mapName && model.mapName !== model.name.toLowerCase()) {
    lines.push(`  collection: '${model.mapName}',`);
  }
  lines.push(`});`);

  // Indexes
  for (const idx of model.indexes) {
    const match = idx.match(/@@index\(\[([^\]]+)\]\)/);
    if (match) {
      const fieldPart = match[1];
      // [fieldName(sort: Desc), ...] → { fieldName: 1/-1 }
      const parts = fieldPart.split(',').map((p: string) => {
        const trimmed = p.trim();
        const desc = trimmed.includes('(sort: Desc)');
        const fieldName = trimmed.replace(/\(sort: Desc\)/, '').trim();
        return `${fieldName}: ${desc ? '-1' : '1'}`;
      }).join(', ');
      lines.push('');
      lines.push(`// Composite index`);
      lines.push(`${model.name}Schema.index({ ${parts} });`);
    }
  }

  // Unique constraints
  for (const uniq of model.uniqueConstraints) {
    const match = uniq.match(/@@unique\(\[([^\]]+)\]\)/);
    if (match) {
      const fields = match[1].replace(/\(sort: Desc\)/g, '').split(',').map((f: string) => {
        const fieldName = f.trim();
        return `${fieldName}: 1`;
      }).join(', ');
      lines.push('');
      lines.push(`// Unique constraint`);
      lines.push(`${model.name}Schema.index({ ${fields} }, { unique: true });`);
    }
  }

  return lines.join('\n');
}

// Enum dosyası üret
function generateEnums(enums: Enum[]): string {
  const lines: string[] = [];
  lines.push('// Enums from Prisma schema — ADR-005 §1a tip eşleme');
  lines.push('');

  for (const enm of enums) {
    lines.push(`export const ${enm.name} = ['${enm.values.join("', '")}'] as const;`);
    lines.push(`export type ${enm.name}Type = typeof ${enm.name}[number];`);
    lines.push('');
  }

  return lines.join('\n');
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const schemaPath = args.find(a => a.startsWith('--schema='))?.replace('--schema=', '');
  const outDir = args.find(a => a.startsWith('--out='))?.replace('--out=', '');
  const strictMode = args.includes('--strict');

  if (!schemaPath || !outDir) {
    console.error('Kullanım: npx ts-node scripts/prisma-to-mongoose.ts --schema=<prisma-schema> --out=<output-dir> [--strict]');
    console.error('Örnek: npx ts-node scripts/prisma-to-mongoose.ts --schema=apps/backend/prisma/schema.prisma --out=packages/shared/shared-persistence/src/schemas/backend');
    process.exit(1);
  }

  if (!fs.existsSync(schemaPath)) {
    console.error(`Schema dosyası bulunamadı: ${schemaPath}`);
    process.exit(1);
  }

  console.log(`Prisma schema okunuyor: ${schemaPath}`);
  const content = fs.readFileSync(schemaPath, 'utf-8');
  const lines = content.split('\n');
  const { models, enums } = parseLines(lines);

  console.log(`Found ${models.length} models, ${enums.length} enums`);

  // Output dizini oluştur
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Her model için schema üret
  let generatedCount = 0;
  for (const model of models) {
    const schemaContent = generateMongooseSchema(model, enums);
    const fileName = `${model.name.charAt(0).toLowerCase() + model.name.slice(1)}.schema.ts`;
    const filePath = path.join(outDir, fileName);

    fs.writeFileSync(filePath, schemaContent);
    console.log(`  Generated: ${fileName} (${model.fields.length} fields)`);
    generatedCount++;
  }

  // Enum'ları ayrı dosyaya yaz
  if (enums.length > 0) {
    fs.writeFileSync(path.join(outDir, 'enums.ts'), generateEnums(enums));
    console.log(`  Generated: enums.ts (${enums.length} enums)`);
  }

  // Index dosyası
  const indexContent = models.map(m => {
    const name = `${m.name.charAt(0).toLowerCase() + m.name.slice(1)}`;
    return `export * from './${name}.schema';`;
  }).join('\n');

  if (enums.length > 0) {
    const enumsExport = enums.map(e => `export const ${e.name} = ['${e.values.join("', '")}'] as const;`).join('\n');
    fs.writeFileSync(path.join(outDir, 'enums.ts'), enumsExport);
  }

  console.log(`\n✅ Done. ${generatedCount} schema files → ${outDir}`);
  console.log(`⚠️  Not: codegen çıktısı strict typing içermez. // TODO: strict typing — codegen yorumları kontrol için var.`);
  console.log(`    strictMode=${strictMode} — eğer false ise any kullanımı TODO olarak işaretlenir.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});