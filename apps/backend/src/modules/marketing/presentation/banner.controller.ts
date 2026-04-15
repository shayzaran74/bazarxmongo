import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@barterborsa/shared-security';

@Controller('banners')
export class BannerController {
  @Public()
  @Get()
  async getBanners(@Query('ecosystem') ecosystem: string) {
    return {
      success: true,
      data: [
        {
          id: '1',
          title: 'Yeni Nesil Ticari Takas',
          subtitle: 'BazarX ile Geleceği Keşfedin',
          image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2000&auto=format&fit=crop',
          link: '/catalog',
        },
        {
          id: '2',
          title: 'Eski Stoklarınızı Değerlendirin',
          subtitle: 'Barter Sistemiyle Kazanın',
          image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2000&auto=format&fit=crop',
          link: '/auth/register',
        }
      ]
    };
  }
}
