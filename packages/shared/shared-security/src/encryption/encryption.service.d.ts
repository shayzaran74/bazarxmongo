export declare class EncryptionService {
    private readonly algorithm;
    private readonly key;
    constructor();
    /**
     * Veriyi şifreler.
     * @param text Şifrelenecek metin
     * @returns Şifrelenmiş veri formatı: iv:authTag:encryptedData
     */
    encrypt(text: string): string;
    /**
     * Şifrelenmiş veriyi çözer.
     * @param encryptedData format: iv:authTag:encryptedData
     * @returns Orijinal metin
     */
    decrypt(encryptedData: string): string;
}
