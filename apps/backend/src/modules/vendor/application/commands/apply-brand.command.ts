import { randomBytes } from 'crypto';

export interface ApplyBrandDto {
  name: string;
  description?: string;
  aliases?: string[];
}

export class ApplyBrandCommand {
  readonly slug: string;

  constructor(
    public readonly userId: string,
    public readonly dto: ApplyBrandDto,
  ) {
    // Slug oluşturmayı command'da yaparak handler'a sadece iş mantığı bırakılır
    const base = dto.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u')
      .replace(/[ş]/g, 's').replace(/[ı]/g, 'i')
      .replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    this.slug = `${base}-${randomBytes(4).toString('hex')}`;
  }
}
