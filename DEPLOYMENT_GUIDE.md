# Production & Demo (Staging) Deployment Rehberi
## MongoDB Atlas + Render (.NET 10 WebAPI) + Vercel (Next.js 15)

Bu rehber, **Prof. Dr. Mustafa Özdemir Dermatoloji Kliniği** projesini mevcut local geliştirme düzenini (`localhost:3000` ↔ `localhost:5145`) bozmadan önce geçici demo/staging ortamına (`*.vercel.app` ↔ `*.onrender.com`), ardından gerçek domaine (`drmustafaozdemir.com`) almanız için adım adım hazırlanmıştır.

> **Önerilen Kurulum Sırası:** `1. MongoDB Atlas` → `2. Local Veriyi Atlas'a Aktarma` → `3. Render (Backend)` → `4. Vercel (Frontend)` → `5. Render CORS & Revalidation Güncellemesi`

---

## 1. MongoDB Atlas Kurulumu (Veritabanı)

1. [cloud.mongodb.com](https://cloud.mongodb.com/) adresine giriş yapın.
2. **Yeni Proje Oluşturma (Ücretsiz M0 Cluster Hakkı İçin):**
   - MongoDB Atlas her proje için **1 adet ücretsiz (M0) Cluster** hakkı verir. Mevcut projenizde (`Project 0`) başka bir ücretsiz cluster varsa, sol üstteki **PROJECT** açılır menüsünden **`+ New Project`** seçeneğine tıklayın.
   - Proje adını **`ClinicMustafaOzdemir`** yapıp **Next > Create Project** deyin.
3. **Cluster Oluşturma:**
   - **Create** (veya **Build a Database**) butonuna tıklayın.
   - Plan olarak **M0 (FREE)** seçin.
   - Provider: **AWS**, Region: **Frankfurt (`eu-central-1`)** seçin.
   - Cluster adını **`ClinicCluster`** verip **Create Deployment** butonuna basın.
4. **Veritabanı Kullanıcısı (Database Access):**
   - Sol menüden **Security > Database & Network Access** (veya açılan sihirbaz) üzerinden bir kullanıcı oluşturun:
     - **Username:** `clinic_admin`
     - **Password:** Güçlü, özel karakter (`@`, `/`, `:`, `?`) içermeyen bir şifre belirleyin (veya URL-encode edin).
     - **Role:** `Read and write to any database`
5. **Ağ Erişimi (Network Access):**
   - **IP Access List > Add IP Address** bölümünden **`Allow Access from Anywhere`** (`0.0.0.0/0`) seçeneğini ekleyip onaylayın. *(Render dinamik IP kullandığı için gereklidir).*
6. **Connection String Alma:**
   - **Clusters > Connect > Drivers (.NET)** seçeneğine tıklayın.
   - Şuna benzer bağlantı cümlesini kopyalayıp `<db_password>` kısmına kendi şifrenizi yazın:
     ```text
     mongodb+srv://clinic_admin:<SIFRENIZ>@cliniccluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=ClinicCluster
     ```

### 1.1. Local Verilerinizi MongoDB Atlas'a Aktarma (Önemli!)
Backend başlangıçta yalnızca indeksleri (`EnsureIndexesAsync`) oluşturur; otomatik veri (seed) eklemez. Admin hesabınızın, 4 kategorinin, tedavilerin ve ayarların canlıda görünmesi için local `ClinicMustafaOzdemirDb` veritabanınızı Atlas'a taşıyın:

**Yöntem A — MongoDB Compass (En Kolay):**
1. MongoDB Compass ile local veritabanınıza (`mongodb://localhost:27017` → `ClinicMustafaOzdemirDb`) bağlanın.
2. `admin_users`, `categories`, `treatments`, `blog_posts`, `site_settings` koleksiyonlarının her birine girip **Export Data > JSON** ile dışa aktarın.
3. Compass'ta yeni bir sekmede Atlas Connection String'inize bağlanın, `ClinicMustafaOzdemirDb` veritabanını oluşturup aynı koleksiyonlara **Add Data > Import JSON** ile yükleyin.

**Yöntem B — Terminal (`mongodump` / `mongorestore`):**
```powershell
mongodump --uri="mongodb://localhost:27017/ClinicMustafaOzdemirDb" --out="./atlas-backup"
mongorestore --uri="mongodb+srv://clinic_admin:<SIFRENIZ>@cliniccluster.xxxxx.mongodb.net/ClinicMustafaOzdemirDb" "./atlas-backup/ClinicMustafaOzdemirDb"
```

---

## 2. Render Kurulumu (Backend — .NET 10 WebAPI)

> Başlamadan önce son commit'lerinizin (`Backend/Dockerfile`, `Backend/.dockerignore`, `/health`, CORS) GitHub'a `git push` edildiğinden emin olun.

1. [dashboard.render.com](https://dashboard.render.com/) adresine girin.
2. Sağ üstten **`+ New`** → **`Web Service`** seçeneğine tıklayın (veya isterseniz önce **`+ Create new project`** ile `Mustafa Ozdemir Clinic` projesi oluşturup içine Web Service ekleyin).
3. GitHub reponuzu (`m.ozdemir-portfolio`) seçip **Connect** deyin.
4. Servis ayarlarını şu şekilde doldurun:
   - **Name:** `clinic-mustafa-ozdemir-api`
   - **Language / Runtime:** **`Docker`**
   - **Branch:** `main` (veya aktif dalınız)
   - **Region:** **`Frankfurt (EU Central)`**
   - **Root Directory:** `Backend`
   - **Dockerfile Path:** `./Dockerfile` *(Root Directory `Backend` seçildiği için otomatik bulunur)*
   - **Instance Type:** `Free` (Demo/Staging için) veya `Starter` (Kesintisiz canlı kullanım için)
   - **Health Check Path (Advanced altında):** `/health`
5. **Environment Variables** bölümüne aşağıdaki anahtarları ekleyin:

| Key (Anahtar) | Value (Örnek / Placeholder Değer) | Açıklama |
| :--- | :--- | :--- |
| `ASPNETCORE_ENVIRONMENT` | `Production` | `Secure=true`, `SameSite=None` çerezlerini aktif eder |
| `MongoDbSettings__ConnectionString` | `mongodb+srv://clinic_admin:<SIFRE>@cliniccluster.xxxxx.mongodb.net/?retryWrites=true&w=majority` | Atlas bağlantı adresi |
| `MongoDbSettings__DatabaseName` | `ClinicMustafaOzdemirDb` | Veritabanı adı |
| `JwtSettings__SecretKey` | `<EN_AZ_32_KARAKTER_RASTGELE_GUCLU_ANAHTAR>` | Canlı JWT imza anahtarı (localden farklı olmalı) |
| `JwtSettings__Issuer` | `Clinic.WebAPI` | JWT Issuer |
| `JwtSettings__Audience` | `Clinic.NextJsClient` | JWT Audience |
| `JwtSettings__ExpiryMinutes` | `15` | Access Token ömrü (dakika) |
| `JwtSettings__RefreshTokenExpiryHours` | `8` | Refresh Token oturum ömrü (saat) |
| `CorsSettings__AllowedOriginsCsv` | `http://localhost:3000` | Vercel deploy sonrası `https://<proje>.vercel.app` eklenecek |
| `NextJsSettings__BaseUrl` | `https://<proje>.vercel.app` | Vercel deploy sonrası güncellenecek (ISR webhook) |
| `NextJsSettings__RevalidationSecret` | `<RASTGELE_GUCLU_REVALIDATION_ANAHTARI>` | Vercel'deki `REVALIDATION_SECRET` ile birebir aynı olmalı |

6. **Create Web Service** butonuna basın.
7. Build tamamlandıktan sonra Render'ın verdiği adresi test edin:
   - `https://<render-servis-adiniz>.onrender.com/health` → `{"status":"healthy"}` dönmelidir.
   - `https://<render-servis-adiniz>.onrender.com/api/categories` → Kategoriler JSON olarak dönmelidir.

---

## 3. Vercel Kurulumu (Frontend — Next.js 15)

1. [vercel.com](https://vercel.com/) adresine girin ve sağ üstten **`+ Create New`** → **`Project`** tıklayın.
2. GitHub reponuzu (`m.ozdemir-portfolio`) bulup **Import** deyin.
3. Proje yapılandırmasını ayarlayın:
   - **Project Name:** `drmustafaozdemir-demo` (veya istediğiniz ad)
   - **Framework Preset:** `Next.js`
   - **Root Directory:** **Edit** butonuna tıklayıp **`Frontend`** klasörünü seçin ve **Continue** deyin.
4. **Environment Variables** bölümünü açıp aşağıdaki 4 değişkeni ekleyin:

| Key (Anahtar) | Value (Örnek / Placeholder Değer) | Açıklama |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://<render-servis-adiniz>.onrender.com/api` | Sonunda `/api` olmalı, sonunda `/` olmamalı |
| `NEXT_PUBLIC_SITE_URL` | `https://drmustafaozdemir-demo.vercel.app` | İlk deploy sonrası gerçek Vercel URL'nize göre kontrol edin |
| `REVALIDATION_SECRET` | `<RENDER_ILE_AYNI_REVALIDATION_ANAHTARI>` | Render'daki `NextJsSettings__RevalidationSecret` ile birebir aynı |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` | Demo `.vercel.app` adresinin Google'da indexlenmesini engeller (`robots.txt` → `Disallow: /`) |

5. **Deploy** butonuna tıklayın ve Vercel'in ürettiği canlı URL'yi (`https://xxxx.vercel.app`) kopyalayın.

---

## 4. Son Bağlantı Döngüsü (CORS + ISR + Doğrulama)

Vercel URL'nizi aldıktan sonra Render tarafında 2 değişkeni güncelleyip bağlantıyı kapatın:

1. **Render Dashboard > Servisiniz > Environment** sekmesine girin:
   - `CorsSettings__AllowedOriginsCsv` değerini şu şekilde güncelleyin (sonunda `/` olmadan):
     ```text
     https://xxxx.vercel.app,http://localhost:3000
     ```
   - `NextJsSettings__BaseUrl` değerini Vercel URL'niz yapın:
     ```text
     https://xxxx.vercel.app
     ```
2. **Save Changes**'a basın (Render servisi otomatik olarak yeniden başlatır / redeploy eder).
3. **Canlı Doğrulama Adımları:**
   - `https://xxxx.vercel.app/robots.txt` → `Disallow: /` döndüğünü doğrulayın (Staging SEO koruması aktif).
   - `https://xxxx.vercel.app` → Ana sayfa, kategoriler, tedaviler ve görsellerin hatasız yüklendiğini doğrulayın.
   - `https://xxxx.vercel.app/admin/login` → Admin girişi yapın, `F5` atın (`HttpOnly` cross-domain `SameSite=None; Secure` cookie ile oturumun düşmediğini doğrulayın).
   - Admin panelden bir tedavi/ayar güncelleyip canlı sayfayı yenileyin (ISR on-demand revalidation testi).
   - Dönüşüm Özeti (`/admin`) sayfasından **`Excel Raporu (.xlsx)`** indirip açın.

---

## 5. Gerçek Domaine (`drmustafaozdemir.com`) Geçişte Yapılacaklar

Demo onaylandıktan sonra gerçek domaine geçerken **hiçbir kod değişikliği yapmadan** yalnızca şu env değerlerini güncelleyeceksiniz:
- **Vercel:**
  - `NEXT_PUBLIC_SITE_URL` = `https://drmustafaozdemir.com`
  - `NEXT_PUBLIC_ALLOW_INDEXING` = `true` *(Google indexleme ve `sitemap.xml` açılır)*
- **Render:**
  - `CorsSettings__AllowedOriginsCsv` = `https://drmustafaozdemir.com,https://www.drmustafaozdemir.com`
  - `NextJsSettings__BaseUrl` = `https://drmustafaozdemir.com`

---

## 6. Önemli Altyapı Notları (Demo vs Production)

1. **Medya Depolama (Render Ephemeral Disk Uyarısı):**
   - `LocalFileStorageService` görselleri sunucu içindeki `wwwroot/uploads` klasörüne kaydeder.
   - Repoda mevcut olan kurumsal ve tedavi görselleri Docker image içine gömüldüğü için her zaman açılır.
   - **Ancak** Render'ın ücretsiz/ephemeral diskinde Admin panelden sonradan yüklenen yeni görseller servis yeniden başladığında (redeploy/sleep) silinir. Gerçek canlıya geçişte **Cloudinary / Cloudflare R2** entegrasyonu veya Render **Persistent Disk** eklenmesi önerilir.
2. **Render Free Plan Uyku Modu (Cold Start):**
   - Render Free servisler 15 dakika trafik gelmezse uykuya geçer ve ilk istekte uyanması 30–50 saniye sürebilir.
   - Demo sunumlarından hemen önce `https://<render-servis-adiniz>.onrender.com/health` adresini tarayıcıda bir kez açarak Backend'i uyandırabilir veya ücretsiz bir ping servisiyle (örn. UptimeRobot) 10 dakikada bir `/health` ucuna istek attırabilirsiniz.
