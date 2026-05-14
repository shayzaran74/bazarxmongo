export declare class HashingService {
    private readonly saltRounds;
    /**
     * Düz metin şifreyi hash'ler.
     */
    hash(plainText: string): Promise<string>;
    /**
     * Düz metin şifre ile hash'lenmiş şifreyi karşılaştırır.
     */
    compare(plainText: string, hash: string): Promise<boolean>;
}
