// apps/backend/src/modules/media/infrastructure/magic-byte.validator.ts
// MIME type string kontrolü atlatılabilir — saldırgan 'image/jpeg' header'ı ile
// .exe veya .php dosyası gönderebilir. Magic byte kontrolü gerçek dosya içeriğini doğrular.

import { BadRequestException } from '@nestjs/common';

interface MagicSignature {
  bytes: Buffer;
  offset: number; // baytın dosyada başladığı konum
}

const SIGNATURES: Record<string, MagicSignature[]> = {
  'image/jpeg': [
    { bytes: Buffer.from([0xff, 0xd8, 0xff]), offset: 0 },
  ],
  'image/jpg': [
    { bytes: Buffer.from([0xff, 0xd8, 0xff]), offset: 0 },
  ],
  'image/png': [
    { bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), offset: 0 },
  ],
  'image/webp': [
    // WebP: RIFF????WEBP — offset 0: RIFF, offset 8: WEBP
    { bytes: Buffer.from([0x52, 0x49, 0x46, 0x46]), offset: 0 },
    { bytes: Buffer.from([0x57, 0x45, 0x42, 0x50]), offset: 8 },
  ],
  'image/gif': [
    { bytes: Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]), offset: 0 }, // GIF87a
    { bytes: Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]), offset: 0 }, // GIF89a
  ],
};

// WEBP için özel kontrol: tüm imzalar eşleşmeli
function matchesWebP(buf: Buffer): boolean {
  const riff = SIGNATURES['image/webp'][0];
  const webp = SIGNATURES['image/webp'][1];
  return (
    buf.length >= 12 &&
    buf.subarray(riff.offset, riff.offset + riff.bytes.length).equals(riff.bytes) &&
    buf.subarray(webp.offset, webp.offset + webp.bytes.length).equals(webp.bytes)
  );
}

// GIF için alternatif imzalar: herhangi biri eşleşmeli
function matchesAlt(buf: Buffer, sigs: MagicSignature[]): boolean {
  return sigs.some(sig =>
    buf.length >= sig.offset + sig.bytes.length &&
    buf.subarray(sig.offset, sig.offset + sig.bytes.length).equals(sig.bytes)
  );
}

/**
 * Buffer'ın gerçek dosya türünü magic byte'lardan doğrular.
 * @param buffer   Dosyanın ilk N baytı (12 bayt yeterli)
 * @param declared Multer'ın bildirdiği MIME type (file.mimetype)
 * @throws BadRequestException — dosya türü eşleşmiyorsa
 */
export function validateMagicBytes(buffer: Buffer, declared: string): void {
  const mime = declared.toLowerCase();

  if (!(mime in SIGNATURES)) {
    throw new BadRequestException(
      `Desteklenmeyen format: ${declared}`,
    );
  }

  let valid = false;

  if (mime === 'image/webp') {
    valid = matchesWebP(buffer);
  } else if (mime === 'image/gif') {
    valid = matchesAlt(buffer, SIGNATURES['image/gif']);
  } else {
    const [sig] = SIGNATURES[mime];
    valid =
      buffer.length >= sig.offset + sig.bytes.length &&
      buffer.subarray(sig.offset, sig.offset + sig.bytes.length).equals(sig.bytes);
  }

  if (!valid) {
    throw new BadRequestException(
      `Dosya içeriği beyan edilen türle uyuşmuyor (${declared}). ` +
      'Lütfen geçerli bir görsel yükleyin.',
    );
  }
}

/**
 * Express.Multer.File nesnesinden magic byte doğrulaması yapar.
 * memoryStorage kullanıldığında file.buffer mevcuttur.
 */
export function validateFileBuffer(file: Express.Multer.File): void {
  if (!file.buffer || file.buffer.length < 12) {
    throw new BadRequestException('Dosya içeriği okunamadı veya çok küçük.');
  }
  // İlk 12 bayt yeterli — tüm magic signature'lar bu aralıkta
  validateMagicBytes(file.buffer.subarray(0, 12), file.mimetype);
}
