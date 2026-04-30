// apps/backend/src/modules/vendor/application/services/file-parser.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { randomBytes } from 'crypto';

// Dosyadan parse edilen ham satır tipi
export interface ParsedRow {
  [key: string]: string | undefined;
}

@Injectable()
export class FileParserService {
  // RFC 4180 uyumlu CSV satır ayrıştırıcı — virgül içeren değerleri doğru işler
  parseCSV(content: string): ParsedRow[] {
    // UTF-8 BOM varsa temizle
    const stripped = content.startsWith('﻿') ? content.slice(1) : content;
    const lines = stripped.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = this.parseCSVLine(lines[0]).map((h) =>
      h.toLowerCase().trim(),
    );
    return lines.slice(1).map((line) => {
      const values = this.parseCSVLine(line);
      const row: ParsedRow = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? '';
      });
      return row;
    });
  }

  // Tırnak içi virgülleri doğru yönetir, çift tırnaktan kaçar
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  async parseExcel(buffer: Buffer): Promise<ParsedRow[]> {
    try {
      // xlsx backend package.json'da kayıtlı (build-time bağımlılık)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const XLSX = require('xlsx') as typeof import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      });
      return rows.map((row) => {
        const normalized: ParsedRow = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[k.toLowerCase().trim()] = String(v ?? '');
        }
        return normalized;
      });
    } catch {
      throw new BadRequestException('Excel dosyası işlenemedi.');
    }
  }

  // Türkçe karakter normalizasyonu + randomBytes suffix (collision güvenli)
  static toSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[ğ]/g, 'g')
      .replace(/[ü]/g, 'u')
      .replace(/[ş]/g, 's')
      .replace(/[ı]/g, 'i')
      .replace(/[ö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${base}-${randomBytes(4).toString('hex')}`;
  }
}
