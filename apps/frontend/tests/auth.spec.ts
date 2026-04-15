import { test, expect } from '@playwright/test';

test.describe('Kimlik Doğrulama Akışı (Auth Flow)', () => {
  const randomId = Math.floor(Math.random() * 10000);
  const testUser = {
    name: `Test User ${randomId}`,
    email: `testuser${randomId}@bazarx.com`,
    password: 'Password123!',
  };

  test('Kullanıcı başarıyla kayıt olmalı ve giriş yapabilmeli', async ({ page }) => {
    // 1. Kayıt Sayfasına Git
    await page.goto('/auth/register');
    await expect(page).toHaveTitle(/Kayıt Ol/);

    // 2. Formu Doldur
    await page.fill('#name', testUser.name);
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.fill('#confirmPassword', testUser.password);
    
    // Onay kutularını işaretle
    await page.check('#acceptTerms');
    await page.check('#kvkkConsent');

    // 3. Kayıt Ol Butonuna Tıkla
    await page.click('button[type="submit"]');

    // 4. Ana Sayfaya Yönlendirmeyi Bekle (Kayıt başarılıysa otomatik login olup /'ye gider)
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');

    // 5. Logout Yap (Eğer Header'da varsa)
    // Şimdilik çerezleri temizleyerek login sayfasına gidelim
    await page.context().clearCookies();
    await page.goto('/auth/login');

    // 6. Yeni Bilgilerle Login Ol
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.check('#acceptTerms');
    await page.click('button[type="submit"]');

    // 7. Tekrar Başarıyla Giriş Yapıldığını Doğrula
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('Hatalı bilgilerle giriş denemesi başarısız olmalı', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('#email', 'wrong@user.com');
    await page.fill('#password', 'WrongPass123!');
    await page.check('#acceptTerms');
    await page.click('button[type="submit"]');

    // Hata mesajının göründüğünü doğrula
    const errorAlert = page.locator('.bg-red-50');
    await expect(errorAlert).toBeVisible();
  });
});
