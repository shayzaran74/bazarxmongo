import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public } from '@barterborsa/shared-security';
import { ISystemSetting } from '@barterborsa/shared-persistence';

const BAZARX_GO_DEFAULTS = {
  showCategories: true,
  categoriesTitle: 'Kategoriler',
  categoriesSubtitle: 'İhtiyacın olan her şey, tek tıkla',
  categories: [],
  showCoupons: true,
  couponsTitle: 'İndirim Kuponların',
  couponsSubtitle: '3 aktif kupon · son 2 gün',
  coupons: [],
  showCuisines: true,
  cuisinesTitle: 'Mutfaklar',
  cuisinesSubtitle: 'Damak tadına göre keşfet',
  cuisines: [],
  showPersonalized: true,
  personalizedTitle: 'Sana Özel Seçimler',
  personalizedSubtitle: 'Geçmişine göre hazırlandı',
  personalizedProducts: []
};

@ApiTags('Public Settings')
@Controller('settings')
export class SettingsController {
  constructor(
    @InjectModel('SystemSetting') private readonly settingModel: Model<ISystemSetting>,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get public BazarX Go settings' })
  @Get('bazarx-go')
  async getBazarxGoSettings(): Promise<{ success: boolean; data: any }> {
    const doc = await this.settingModel.findOne({ key: 'bazarxGoSettings' }).lean().exec();
    return { success: true, data: { ...BAZARX_GO_DEFAULTS, ...(doc?.value || {}) } };
  }
}
