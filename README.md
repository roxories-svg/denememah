# 📚 Mahir Hocam - Fizik Eğitim Portalı (Gerçek Firebase Mimarisi)

**Mahir Hocam** web portalı; Fizik Öğretmeni ve Zümre Başkanı **Mahir Şengün** tarafından öğrencilerine yönelik hazırlanan, tamamen gerçek **Firebase Auth**, **Firestore** ve **Storage** veritabanına bağlı, yazılı çalışma PDF'leri, geri sayımlı kilit sistemi ve öğrenci giriş loglama altyapısına sahip modern bir eğitim platformudur.

---

## 🎯 Marka ve Yönetici Kimliği
- **Site Adı & Logosu:** **Mahir Hocam** (Değişmez portal başlığı ve marka kimliği).
- **Yönetici & Öğretmen Resmi Adı:** **Mahir Şengün** (Yönetim panelinde, PDF yüklemelerinde ve duyurularda resmi öğretmen kimliği).

---

## 🚀 Yeni Mimari & Uygulanan Özellikler

### 1. Sahte Verilerden Tamamen Arındırılmış Yapı
- Tüm statik/sahte soru ve PDF listeleri, geçici mock seeds koddan silindi.
- Yazılı PDF'leri doğrudan Firestore `pdfs` koleksiyonundan, duyurular `announcements` koleksiyonundan dinamik ve anlık (`onSnapshot`) olarak listelenir.

### 2. Gerçek Kimlik Doğrulama (Firebase Auth)
- Sahte test/demo giriş butonları kaldırıldı.
- Kullanıcılar gerçek Google hesabı (`signInWithPopup`) veya E-posta & Şifre ile sisteme kaydolur ve giriş yapar.
- Mahir Şengün'ün mail adresi (`VITE_ADMIN_EMAIL` veya `mahirsengun@...`) üzerinden giriş yapıldığında sistem doğrudan tam yetkili Öğretmen/Admin modunu etkinleştirir.

### 3. Öğrenci Giriş Takip ve Loglama Sistemi (Admin Paneli)
- Bir öğrenci sisteme Google veya E-posta ile giriş yaptığı anda, Firestore `login_logs` koleksiyonuna:
  - Öğrenci Adı - Soyadı
  - E-posta Adresi
  - Sınıf / Şube
  - Giriş Tarihi ve Saati (Türkçe formatında)
  - Cihaz / Tarayıcı türü (Masaüstü / Mobil)
  otomatik olarak kaydedilir.
- **Mahir Şengün Admin Paneli:** Üst menüden *"Giriş Takibi"* butonuna tıklayarak hangi öğrencinin ne zaman portala girdiğini canlı olarak filtreleyip takip edebilir.

### 4. Yazılı PDF'leri & Geri Sayımlı Kilit Mekanizması
- **Mahir Şengün Paneli:**
  - *"Yeni Yazılı PDF'i Yükle"* formu ile dosya adı belirlenir, PDF bilgisayardan seçilerek **Firebase Storage**'a yüklenir ve kilitlenme tarihi/saati (`deadline`) belirlenir.
- **Öğrenci Görünümü & Canlı Geri Sayım:**
  - Tüm öğrenciler Mahir Şengün'ün yüklediği PDF'leri ve üzerindeki **Gün, Saat, Dakika, Saniye** canlı geri sayım sayacını görür.
  - Süre dolduğunda veya öğretmen manuel kilitlediğinde dosya **"🔒 Süre Doldu / Kilitlendi"** durumuna geçer, indirme ve inceleme kapatılır.
  - Mahir Şengün dilediği an kilidi panelinden tek tıkla tekrar açabilir.

### 5. Canlı Duyuru Paneli
- Mahir Şengün'ün eklediği duyurular Firestore `announcements` koleksiyonuna kaydedilir ve öğrencilerin ekranında anlık olarak güncellenir.

---

## 🛠️ Firebase Kurulumu (`.env`)

Proje kök dizinindeki `.env.example` dosyasını `.env` olarak kaydedip Firebase Console bilgilerinizi ekleyiniz:

```env
VITE_FIREBASE_API_KEY=AIzaSyYourActualApiKeyHere
VITE_FIREBASE_AUTH_DOMAIN=mahir-hocam-fizik.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mahir-hocam-fizik
VITE_FIREBASE_STORAGE_BUCKET=mahir-hocam-fizik.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=102938475612
VITE_FIREBASE_APP_ID=1:102938475612:web:abcdef1234567890

# Mahir Şengün Admin E-postası
VITE_ADMIN_EMAIL=mahirsengun@fizik.k12.tr
```

---

## 💻 Çalıştırma

```powershell
cd C:\Users\hasan\.gemini\antigravity\scratch\fizik-sinav-portali
npm run dev
```

Tarayıcınızda `http://localhost:5173` adresine giderek portala erişebilirsiniz.

## Yapay Zeka Asistanı (Gemini)

Asistan, `@google/generative-ai` SDK'sını doğrudan istemciden kullanır. Proje kökündeki `.env` dosyasına şu değişkeni ekleyip Vite sunucusunu yeniden başlatın:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Metin ve PNG/JPG/WebP soru görselleri `gemini-2.5-flash` modeline birlikte gönderilir. `VITE_` değişkenleri istemci bundle'ında görülebilir; bu nedenle bu düzen, anahtarın tarayıcı kullanıcılarına açık olmasını kabul eder. Anahtarı kısıtlayın ve kullanım/kota limitlerini Google AI Studio veya Google Cloud üzerinden ayarlayın.
