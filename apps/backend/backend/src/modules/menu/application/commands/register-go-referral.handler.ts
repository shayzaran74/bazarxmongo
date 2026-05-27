// apps/backend/src/modules/menu/application/commands/register-go-referral.handler.ts
// BazarX-GO §7 — Referans kaydı + XP + 3. referansta bonus menü

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IGoReferral, IUserLevel, IXpTransaction, IMembershipPlan, IMenuPurchase, IListing } from '@barterborsa/shared-persistence';
import { RegisterGoReferralCommand } from './register-go-referral.command';
import { calculateReferralBonus, REFERRAL_XP, REFERRAL_BONUS_TTL_DAYS } from '../../domain/referral-bonus.constants';
import { QrGeneratorService } from '../services/qr-generator.service';

const d128 = (v: number) => Types.Decimal128.fromString(v.toFixed(2));

@CommandHandler(RegisterGoReferralCommand)
export class RegisterGoReferralHandler implements ICommandHandler<RegisterGoReferralCommand> {
  private readonly logger = new Logger(RegisterGoReferralHandler.name);

  constructor(
    @InjectModel('GoReferral')    private readonly referralModel:  Model<IGoReferral>,
    @InjectModel('UserLevel')     private readonly levelModel:     Model<IUserLevel>,
    @InjectModel('XpTransaction') private readonly xpTxModel:     Model<IXpTransaction>,
    @InjectModel('MembershipPlan')private readonly planModel:     Model<IMembershipPlan>,
    @InjectModel('MenuPurchase')  private readonly purchaseModel:  Model<IMenuPurchase>,
    @InjectModel('Listing')       private readonly listingModel:   Model<IListing>,
    private readonly qr: QrGeneratorService,
  ) {}

  async execute(cmd: RegisterGoReferralCommand) {
    const { referralCode, refereeId, refereeTier, paidAmount } = cmd;

    // Aynı kişi zaten referans aldı mı?
    const alreadyReferred = await this.referralModel.findOne({ refereeId });
    if (alreadyReferred) {
      throw new BadRequestException('Bu kullanıcı zaten bir referans koduyla kayıt olmuş');
    }

    // Referans kodu → referrerId çöz (kod = referrerId'nin ilk 12 hex)
    const referrerRecord = await this.referralModel.findOne({ referralCode }).lean();
    const referrerId = referrerRecord?.referrerId
      ?? referralCode.replace('GO-', ''); // fallback: doğrudan userId

    if (referrerId === refereeId) {
      throw new BadRequestException('Kendi referans kodunuzu kullanamazsınız');
    }

    // Referanssız zincirleme önlemi — referrer'ın kendisi de bir referee mi?
    const referrerIsReferee = await this.referralModel.findOne({ refereeId: referrerId });
    if (referrerIsReferee) {
      throw new BadRequestException('Zincirleme referans sistemi desteklenmemektedir');
    }

    // Referrer'ın toplam referans sayısı (bu kayıt dahil)
    const existingReferrals = await this.referralModel
      .find({ referrerId })
      .sort({ createdAt: 1 })
      .lean<IGoReferral[]>();

    const referralCount = existingReferrals.length + 1; // bu yeni referans dahil
    const isBonusTrigger = referralCount === 3;

    // §7 Bonus hesabı — 3. referansta tetiklenir
    let bonusCategory: number | undefined;
    let bonusPurchaseId: string | undefined;
    let bonusExpiresAt: Date | undefined;

    if (isBonusTrigger) {
      // 3 referansın ödediği aidatları topla
      const prevAmounts = existingReferrals.map(r =>
        parseFloat((r.refereePaidAmount as unknown as { toString(): string })?.toString() ?? '0')
      );
      const allAmounts = [...prevAmounts, paidAmount];

      const bonus = calculateReferralBonus(allAmounts);
      bonusCategory = bonus.bonusCategory;

      this.logger.log(
        `3. referans bonus: referrerId=${referrerId} ` +
        `total=${bonus.total}₺ matchedTier=${bonus.matchedTier} ` +
        `bonusTier=${bonus.bonusTier} kategori=${bonus.bonusCategory}`,
      );

      // Bonus menü hakkı için uygun bir listing bul (kategori eşleşmeli)
      const bonusListing = await this.listingModel.findOne({
        isActive: true,
        status: 'ACTIVE',
        menuCategory: bonus.bonusCategory,
      }).lean();

      if (bonusListing) {
        bonusPurchaseId = new Types.ObjectId().toString();
        bonusExpiresAt  = new Date(Date.now() + REFERRAL_BONUS_TTL_DAYS * 24 * 60 * 60 * 1000);

        // Ücretsiz bonus menü QR oluştur
        await this.purchaseModel.create([{
          _id:          bonusPurchaseId,
          id:           bonusPurchaseId,
          userId:       referrerId,
          listingId:    bonusListing.id,
          status:       'ACTIVE',
          paidAmount:   d128(0),
          serviceFee:   d128(0),
          vatAmount:    d128(0),
          qrCode:       this.qr.generate(),
          qrExpiresAt:  bonusExpiresAt,
          menuCategory: bonus.bonusCategory,
          isTransferred:false,
          xpEarned:     0,
        }]);

        this.logger.log(`Bonus QR oluşturuldu: purchaseId=${bonusPurchaseId} referrerId=${referrerId}`);
      }
    }

    // Referans kaydını oluştur
    const newId = new Types.ObjectId().toString();
    await this.referralModel.create([{
      _id:                 newId,
      id:                  newId,
      referrerId,
      refereeId,
      referralCode,
      refereeTier,
      refereePaidAmount:   d128(paidAmount),
      xpGrantedToReferrer: REFERRAL_XP.toReferrer,
      xpGrantedToReferee:  REFERRAL_XP.toReferee,
      isBonusTrigger,
      bonusMenuCategory:   bonusCategory,
      bonusPurchaseId,
      bonusExpiresAt,
      status:              isBonusTrigger && bonusPurchaseId ? 'BONUS_GRANTED' : 'ACTIVATED',
    }]);

    // XP — referrer
    await this.levelModel.findOneAndUpdate(
      { userId: referrerId },
      { $inc: { currentXp: REFERRAL_XP.toReferrer, lifetimeXp: REFERRAL_XP.toReferrer } },
      { upsert: false },
    );
    const refTxId = new Types.ObjectId().toString();
    await this.xpTxModel.create([{
      _id: refTxId, id: refTxId,
      userId:      referrerId,
      amount:      REFERRAL_XP.toReferrer,
      type:        'REFERRAL',
      description: `Referans #${referralCount}: ${refereeTier} üye`,
      referenceId: newId,
    }]);

    // XP — referee (karşılama bonusu)
    await this.levelModel.findOneAndUpdate(
      { userId: refereeId },
      { $inc: { currentXp: REFERRAL_XP.toReferee, lifetimeXp: REFERRAL_XP.toReferee } },
      { upsert: false },
    );
    const refTeeTxId = new Types.ObjectId().toString();
    await this.xpTxModel.create([{
      _id: refTeeTxId, id: refTeeTxId,
      userId:      refereeId,
      amount:      REFERRAL_XP.toReferee,
      type:        'REFERRAL',
      description: 'BazarX-GO karşılama bonusu (referans ile kayıt)',
      referenceId: newId,
    }]);

    this.logger.log(`Referans kaydedildi: #${referralCount} referrerId=${referrerId} refereeId=${refereeId}`);

    return {
      success:        true,
      referralCount,
      isBonusTrigger,
      xpEarned:       REFERRAL_XP.toReferrer,
      bonusCategory,
      bonusPurchaseId,
      message:        isBonusTrigger
        ? `3. referansın tamamlandı! Kategori ${bonusCategory} bonus menü hakkın QR cüzdanına eklendi.`
        : `Referans #${referralCount} kaydedildi — ${REFERRAL_XP.toReferrer} XP kazandın.`,
    };
  }
}
