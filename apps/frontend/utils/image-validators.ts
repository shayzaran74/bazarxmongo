export const MAX_FILE_SIZE = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export interface ValidationResult {
    isValid: boolean
    error: string | null
}

export const validateImage = (file: File | null): ValidationResult => {
    if (!file) return { isValid: false, error: 'Dosya seçilmedi' }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type))
        return { isValid: false, error: 'Sadece JPG, PNG ve WebP formatları desteklenmektedir.' }
    if (file.size > MAX_FILE_SIZE)
        return { isValid: false, error: `Dosya boyutu çok büyük. Maksimum ${MAX_FILE_SIZE / (1024 * 1024)}MB yükleyebilirsiniz.` }
    return { isValid: true, error: null }
}
