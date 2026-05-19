// apps/backend/src/modules/vendor/application/services/file-parser.service.ts

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';

// Dosyadan parse edilen ham satır tipi
export interface ParsedRow {
  [key: string]: string | undefined;
}

@Injectable()
export class FileParserService {
  private readonly logger = new Logger(FileParserService.name);

  // RFC 4180 uyumlu CSV satır ayrıştırıcı — virgül içeren değerleri doğru işler
  parseCSV(content: string): ParsedRow[] {
    this.logger.debug(`[parseCSV] Gelen içerik uzunluğu: ${content.length} char`);
    // UTF-8 BOM varsa temizle
    const stripped = content.startsWith('﻿') ? content.slice(1) : content;
    const lines = stripped.split(/\r?\n/).filter((l) => l.trim().length > 0);
    this.logger.debug(`[parseCSV] Satır sayısı (boş satırlar filtreli): ${lines.length}`);
    if (lines.length < 2) {
      this.logger.warn('[parseCSV] Yeterli satır yok (header + data en az 2 olmalı)');
      return [];
    }

    const headers = this.parseCSVLine(lines[0]).map((h) =>
      h.toLowerCase().trim(),
    );
    this.logger.debug(`[parseCSV] Header sayısı: ${headers.length}, başlıklar: ${headers.join(', ')}`);
    const rows = lines.slice(1).map((line, idx) => {
      const values = this.parseCSVLine(line);
      const row: ParsedRow = {};
      headers.forEach((h, i) => {
        row[h] = values[i] ?? '';
      });
      return row;
    });
    this.logger.debug(`[parseCSV] Parse edilen veri satırı: ${rows.length}`);
    return rows;
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

  parseJSON(content: string): ParsedRow[] {
    try {
      const parsed: unknown = JSON.parse(content);
      const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
      return arr.map((item) => {
        const row: ParsedRow = {};
        for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
          row[k.toLowerCase().trim()] = v !== null && v !== undefined ? String(v) : '';
        }
        return row;
      });
    } catch {
      throw new BadRequestException('JSON dosyası işlenemedi. Geçerli bir JSON dizisi olmalı.');
    }
  }

  async parseExcel(buffer: Buffer): Promise<ParsedRow[]> {
    this.logger.debug(`[parseExcel] Buffer boyutu: ${buffer.length} byte`);
    try {
      // xlsx backend package.json'da kayıtlı (build-time bağımlılık)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const XLSX = require('xlsx') as typeof import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: '',
      });
      this.logger.debug(`[parseExcel] Sheet "${workbook.SheetNames[0]}" — satır: ${rows.length}`);
      return rows.map((row) => {
        const normalized: ParsedRow = {};
        for (const [k, v] of Object.entries(row)) {
          normalized[k.toLowerCase().trim()] = String(v ?? '');
        }
        return normalized;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error(`[parseExcel] Hata: ${msg}`);
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
