using Clinic.Domain.Entities;
using Clinic.Domain.ValueObjects;
using Clinic.Persistence.Context;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace Clinic.Persistence.Seed;

public class DatabaseSeeder
{
    private readonly MongoDbContext _context;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(MongoDbContext context, ILogger<DatabaseSeeder> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.EnsureIndexesAsync(cancellationToken);

            await SeedAdminUserAsync(cancellationToken);
            await SeedSiteSettingsAsync(cancellationToken);
            var categories = await SeedCategoriesAsync(cancellationToken);
            await SeedTreatmentsAsync(categories, cancellationToken);
            await SeedBlogsAsync(cancellationToken);

            _logger.LogInformation("Prof. Dr. Mustafa Özdemir Kliniği veritabanı başlangıç (Seed) kontrolü başarıyla tamamlandı.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "MongoDB Seed işlemi sırasında bağlantı kurulamadı veya hata oluştu. MongoDB servisinin çalıştığından emin olun.");
        }
    }

    private async Task SeedAdminUserAsync(CancellationToken cancellationToken)
    {
        if (await _context.AdminUsers.Find(_ => true).AnyAsync(cancellationToken))
            return;

        var admin = new AdminUser
        {
            Email = "mustafaozdemir@yahoo.com",
            FullName = "Prof. Dr. Mustafa Özdemir",
            Role = "SuperAdmin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("MustafaOzdemir2026!")
        };

        await _context.AdminUsers.InsertOneAsync(admin, cancellationToken: cancellationToken);
    }

    private async Task SeedSiteSettingsAsync(CancellationToken cancellationToken)
    {
        if (await _context.SiteSettings.Find(_ => true).AnyAsync(cancellationToken))
            return;

        var settings = new SiteSettings
        {
            ClinicName = "Prof. Dr. Mustafa Özdemir Dermatoloji & Lazer Kliniği",
            DoctorName = "Prof. Dr. Mustafa Özdemir",
            DoctorTitle = "Dermatoloji (Deri ve Zührevi Hastalıkları) Uzmanı",
            DoctorBio = "<p><strong>Prof. Dr. Mustafa Özdemir</strong>, 1995 yılında İstanbul Üniversitesi Cerrahpaşa Tıp Fakültesi'nden mezun olmuştur. Dermatoloji (Deri ve Zührevi Hastalıklar) uzmanlık eğitimini tamamladıktan sonra akademik çalışmalarını sürdürerek 2015 yılında <strong>Profesör</strong> unvanını almıştır.</p><p>Klinik dermatoloji, lazer tedavileri, dermatoskopik ben taraması, HPV ve genital siğil tedavileri, akne ve leke tedavileri ile kozmetik dermatoloji alanlarında ulusal ve uluslararası hakemli dergilerde yayımlanmış çok sayıda bilimsel makalesi bulunmaktadır. Şu anda İstanbul Bakırköy / Ataköy Towers'taki özel kliniğinde hastalarına kanıta dayalı modern dermatoloji hizmeti sunmaktadır.</p>",
            Address = "Ataköy 7-8-9-10. Kısım Mah. Çobançeşme E-5 Yanyol Cad. Ataköy Towers B-Blok No:146, 34158 Bakırköy/İstanbul",
            PhoneNumbers = new List<string> { "+90 552 265 64 36", "0 553 794 26 00" },
            WhatsAppNumber = "905522656436",
            Email = "mustafaozdemir@yahoo.com",
            WorkingHours = "Pazartesi - Cumartesi: 09:30 - 19:00",
            GoogleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.660602418987!2d28.8315!3d40.9895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU5JzIyLjIiTiAyOMKwNDknNTMuNCJF!5e0!3m2!1str!2str!4v1700000000000!5m2!1str!2str",
            SocialMedia = new SocialMediaLinks
            {
                Instagram = "https://www.instagram.com/prof.dr.mustafaozdemir",
                Facebook = "https://www.facebook.com/drmustafaozdemir"
            },
            LegalNotice = "T.C. Sağlık Bakanlığı yönergeleri gereği sitemizde işlem fiyatları belirtilmemekte olup, tüm içerikler yalnızca bilgilendirme amaçlıdır. Tanı ve tedavi için mutlaka uzman hekiminize başvurunuz."
        };

        await _context.SiteSettings.InsertOneAsync(settings, cancellationToken: cancellationToken);
    }

    private async Task<Dictionary<string, Category>> SeedCategoriesAsync(CancellationToken cancellationToken)
    {
        var existing = await _context.Categories.Find(_ => true).ToListAsync(cancellationToken);
        if (existing.Count > 0)
        {
            return existing.ToDictionary(x => x.Slug, x => x);
        }

        var categories = new List<Category>
        {
            new()
            {
                Title = "Dermatoloji",
                Slug = "dermatoloji",
                Description = "Akne, rozasea, egzama, sedef hastalığı, vitiligo, HPV genital siğil, ben taraması ve çocuk deri hastalıklarında kanıta dayalı klinik dermatoloji tanı ve tedavileri.",
                DisplayOrder = 1,
                Seo = new SeoMetadata
                {
                    MetaTitle = "Klinik Dermatoloji Tedavileri | Prof. Dr. Mustafa Özdemir - Bakırköy",
                    MetaDescription = "İstanbul Bakırköy Ataköy'de Prof. Dr. Mustafa Özdemir kliniğinde akne, ben taraması, HPV genital siğil, sedef, egzama ve mantar hastalıkları tedavisi.",
                    FocusKeywords = new List<string> { "dermatoloji uzmanı bakırköy", "ataköy dermatolog", "prof dr mustafa özdemir", "cildiye uzmanı istanbul" }
                }
            },
            new()
            {
                Title = "Kozmetik Dermatoloji",
                Slug = "kozmetik-dermatoloji",
                Description = "Ameliyatsız ip askısı, kimyasal ve karbon peeling, leke tedavileri, aşırı terleme (hiperhidroz), mezoterapi ve medikal cilt bakımı uygulamaları.",
                DisplayOrder = 2,
                Seo = new SeoMetadata
                {
                    MetaTitle = "Kozmetik Dermatoloji Uygulamaları | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Uzman dermatolog kontrolünde leke tedavisi, ameliyatsız ip askısı, karbon peeling, kimyasal peeling ve aşırı terleme (hiperhidroz) uygulamaları.",
                    FocusKeywords = new List<string> { "kozmetik dermatoloji istanbul", "ameliyatsız ip askısı", "kimyasal peeling bakırköy", "hiperhidroz tedavisi" }
                }
            },
            new()
            {
                Title = "Saç Hastalıkları",
                Slug = "sac-hastaliklari",
                Description = "Saç dökülmesi, saç kıran (alopesi areata), saç mezoterapisi ve saçlı deri hastalıklarının dermatolojik tanı ve tedavi protokolleri.",
                DisplayOrder = 3,
                Seo = new SeoMetadata
                {
                    MetaTitle = "Saç Hastalıkları ve Saç Dökülmesi Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Saç dökülmesi, saç kıran (alopesi areata) ve saç mezoterapisi alanlarında Prof. Dr. Mustafa Özdemir ile bilimsel dermatolojik çözümler.",
                    FocusKeywords = new List<string> { "saç dökülmesi tedavisi", "saç mezoterapisi bakırköy", "saç kıran tedavisi", "saç hastalıkları uzmanı" }
                }
            },
            new()
            {
                Title = "Lazer Tedavileri",
                Slug = "lazer",
                Description = "Lazerle leke tedavisi, dövme silme, kılcal damar ve varis tedavisi, cilt yenileme, sivilce izleri ve çatlak tedavilerinde ileri teknoloji lazer sistemleri.",
                DisplayOrder = 4,
                Seo = new SeoMetadata
                {
                    MetaTitle = "Lazerle Cilt ve Leke Tedavileri | Prof. Dr. Mustafa Özdemir - Ataköy",
                    MetaDescription = "Ataköy Bakırköy'de lazerle leke tedavisi, dövme silme, kılcal damar tedavisi, sivilce izleri ve cilt yenileme işlemleri uzman hekim kontrolünde uygulanır.",
                    FocusKeywords = new List<string> { "lazerle leke tedavisi", "lazerle dövme silme bakırköy", "kılcal damar lazer tedavisi", "sivilce izi lazer" }
                }
            }
        };

        await _context.Categories.InsertManyAsync(categories, cancellationToken: cancellationToken);
        return categories.ToDictionary(x => x.Slug, x => x);
    }

    private async Task SeedTreatmentsAsync(Dictionary<string, Category> categories, CancellationToken cancellationToken)
    {
        if (await _context.Treatments.Find(_ => true).AnyAsync(cancellationToken))
            return;

        var dermatolojiId = categories["dermatoloji"].Id;
        var kozmetikId = categories["kozmetik-dermatoloji"].Id;
        var sacId = categories["sac-hastaliklari"].Id;
        var lazerId = categories["lazer"].Id;

        var treatments = new List<Treatment>
        {
            // 1. Lazerle Leke Tedavisi
            new()
            {
                Title = "Lazerle Leke Tedavisi",
                Slug = "lazerle-leke-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 1,
                CoverImageUrl = "/images/treatments/lazerle-leke-tedavisi.webp",
                Summary = "Güneş lekeleri, melazma, yaşlılık lekeleri ve doğum sonrası oluşan cilt lekelerinde cildin katmanlarına uygun modern lazer protokolleri ile güvenli leke tedavisi.",
                HtmlContent = @"
                    <h2>Lazerle Leke Tedavisi Nedir?</h2>
                    <p>Cilt lekeleri; güneş ışınları (UV), hormonal değişimler, gebelik (melazma), yaşlanma veya sivilce sonrası (post-inflamatuar hiperpigmentasyon) melanin pigmentinin belirli bölgelerde aşırı birikmesi sonucu oluşur. <strong>Prof. Dr. Mustafa Özdemir</strong> tarafından yapılan dermatolojik muayene ve Wood ışığı / dermatoskopik analiz sonrasında lekenin derinliği (epidermal, dermal veya mikst tip) tespit edilerek kişiye özel lazer protokolü belirlenir.</p>
                    <h3>Hangi Cilt Lekelerinde Uygulanır?</h3>
                    <ul>
                        <li><strong>Melazma (Gebelik ve Hormonal Lekeler):</strong> Alın, yanak ve dudak üstünde simetrik yerleşen dirençli lekeler.</li>
                        <li><strong>Solar Lentigo (Güneş ve Yaşlılık Lekeleri):</strong> Yüz, el sırtı ve dekolte bölgesinde güneşe bağlı gelişen kahverengi lekeler.</li>
                        <li><strong>Çiller (Efelid):</strong> Genetik ve güneş maruziyetiyle belirginleşen pigmentasyonlar.</li>
                        <li><strong>Akne Sonrası Lekeler:</strong> Sivilce iyileşirken kalan kahverengi ve kırmızımsı izler.</li>
                    </ul>
                    <h3>Tedavi Süreci ve Dikkat Edilmesi Gerekenler</h3>
                    <p>Lazer ışığı yalnızca hedef melanin pigmentini parçalayarak çevre dokuya zarar vermeden hücresel düzeyde temizlenme sağlar. İşlem sonrasında düzenli yüksek faktörlü güneş koruyucu kullanımı ve hekimin önerdiği bariyer onarıcı bakım protokolü tedavinin başarısını kalıcı hale getirir.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Lazerle leke tedavisi kaç seans sürer?",
                        Answer = "Lekenin derinliğine, tipine (güneş lekesi, melazma vb.) ve cilt yapısına göre değişmekle birlikte genellikle 3 ila 6 seans arasında planlanmaktadır."
                    },
                    new()
                    {
                        Question = "Lazerle leke tedavisi hangi mevsimde yapılmalıdır?",
                        Answer = "Güneş ışınlarının daha dik geldiği yaz ayları yerine sonbahar ve kış aylarında uygulanması, işlem sonrası yeni leke oluşumu riskini en aza indirmek için tercih edilir."
                    },
                    new()
                    {
                        Question = "İşlem sonrası sosyal hayata hemen dönülebilir mi?",
                        Answer = "Evet, uygulama sonrasında hafif bir kızarıklık oluşabilir ancak genellikle birkaç saat içinde geriler ve hastalarımız güneş koruyucu kullanarak günlük yaşamlarına devam edebilir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Lazerle Leke Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir - Bakırköy",
                    MetaDescription = "Güneş lekesi, melazma ve sivilce lekelerinde uzman dermatolog Prof. Dr. Mustafa Özdemir kontrolünde Bakırköy Ataköy'de lazerle leke tedavisi.",
                    FocusKeywords = new List<string> { "lazerle leke tedavisi", "melazma tedavisi istanbul", "güneş lekesi lazer bakırköy", "leke tedavisi dermatolog" }
                }
            },

            // 2. Akne (Sivilce) Tedavisi
            new()
            {
                Title = "Akne (Sivilce) Tedavisi",
                Slug = "akne-sivilce-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 2,
                CoverImageUrl = "/images/treatments/akne-sivilce-tedavisi.webp",
                Summary = "Ergenlik ve yetişkinlik dönemi akne (sivilce) problemlerinde kalıcı iz oluşumunu engelleyen medikal, topikal ve lazer destekli bütüncül dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>Akne (Sivilce) Neden Oluşur ve Nasıl Tedavi Edilir?</h2>
                    <p><strong>Akne vulgaris</strong>, yağ bezlerinin (sebase bezler) aşırı sebum üretimi, gözeneklerin tıkanması (komedon oluşumu) ve <em>Cutibacterium acnes</em> bakterisinin çoğalmasıyla seyreden kronik inflamatuar bir deri hastalığıdır. Yalnızca ergenlik döneminde değil, 25 yaş üstü yetişkinlerde de hormonal faktörler, stres ve yanlış kozmetik kullanımı nedeniyle sıkça görülür.</p>
                    <h3>Kişiye Özel Akne Tedavi Yaklaşımımız</h3>
                    <ul>
                        <li><strong>Klinik Derecelendirme:</strong> Komedonal, papülopüstüler veya nodülokistik akne tipinin belirlenmesi.</li>
                        <li><strong>Medikal ve Topikal Tedaviler:</strong> Cilt bariyerini bozmadan sebum dengesini sağlayan topikal retinoidler, antibakteriyel ajanlar ve gerekli vakalarda kan tahlili takibiyle sistemik tedaviler.</li>
                        <li><strong>Akne İzleri (Skar) Önleme:</strong> Aktif sivilceler kontrol altına alındıktan sonra çukur (atrofik skar) ve leke kalmaması için lazer ve peeling protokolleri.</li>
                    </ul>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Sivilce tedavisinde ne zaman sonuç alınmaya başlanır?",
                        Answer = "Deri yenilenme döngüsü dikkate alındığında, düzenli medikal tedaviyle ilk belirgin iyileşmeler 4-6. haftalarda başlar; tam kontrol genellikle 3-6 ay sürer."
                    },
                    new()
                    {
                        Question = "Sivilceleri sıkmak neden kalıcı iz bırakır?",
                        Answer = "Sivilce sıkıldığında folikül duvarı dermis tabakasına doğru yırtılır, iltihap derin dokuya yayılır ve kolajen dokusu hasar görerek kalıcı çukur (skar) veya koyu leke oluşmasına yol açar."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Akne (Sivilce) Tedavisi Bakırköy | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Ergenlik ve yetişkin sivilceleri, kistik akne ve sivilce izleri için Prof. Dr. Mustafa Özdemir kliniğinde bilimsel dermatolojik akne tedavisi.",
                    FocusKeywords = new List<string> { "akne tedavisi istanbul", "sivilce doktoru bakırköy", "sivilce tedavisi dermatolog", "kistik akne tedavisi" }
                }
            },

            // 3. HPV – Genital Siğil Tedavisi
            new()
            {
                Title = "HPV – Genital Siğil Tedavisi",
                Slug = "hpv-genital-sigil-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 3,
                CoverImageUrl = "/images/treatments/hpv-genital-sigil-tedavisi.webp",
                Summary = "Human Papilloma Virüsü (HPV) kaynaklı genital siğil (kondilom) lezyonlarında hasta mahremiyetine tam özen gösteren, hızlı ve nüks riskini azaltan dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>HPV ve Genital Siğil (Kondilom) Nedir?</h2>
                    <p><strong>Human Papilloma Virüsü (HPV)</strong>, cilt ve mukozalarda enfeksiyona yol açan ve çoğunlukla cinsel temas yoluyla bulaşan yaygın bir virüstür. Genital bölgede, kasıkta veya perianal bölgede deri renginde ya da kahverengi, karnabahar görünümünde kabarıklıklar (<strong>kondiloma aküminata</strong>) şeklinde kendini gösterir.</p>
                    <h3>Kliniğimizde Uygulanan Tedavi Yöntemleri</h3>
                    <p><strong>Prof. Dr. Mustafa Özdemir</strong> kliniğinde hasta gizliliği ve mahremiyeti en üst düzeyde tutularak, lezyonların yaygınlığına ve yerleşim yerine göre en uygun yöntem seçilir:</p>
                    <ul>
                        <li><strong>Kriyoterapi (Dondurma Tedavisi):</strong> Sıvı nitrojen ile siğil dokusunun kontrollü olarak tahrip edilmesi.</li>
                        <li><strong>Elektrokoterizasyon ve Lazer Ablasyon:</strong> Lokal anestezi altında dirençli veya yaygın siğillerin tek seansta temizlenmesi.</li>
                        <li><strong>İmmünmodülatör Kremler ve Takip Protokolü:</strong> Nüks (tekrarlama) riskini en aza indirmek için bağışıklık destekleyici topikal uygulamalar ve periyodik dermatoskopik kontrol.</li>
                    </ul>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Genital siğil işlemi sırasında ağrı hissedilir mi?",
                        Answer = "Uygulama öncesinde sürülen anestezik kremler veya lokal anestezi sayesinde işlem sırasında ağrı hissedilmez ve hasta aynı gün günlük yaşantısına dönebilir."
                    },
                    new()
                    {
                        Question = "HPV tedavisinden sonra siğiller tekrarlar mı?",
                        Answer = "Gözle görülmeyen kuluçka dönemindeki virüsler nedeniyle ilk aylarda yeni lezyonlar çıkabilir; bu nedenle ilk 3-6 ay düzenli dermatolog kontrolü ve bağışıklık takibi büyük önem taşır."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "HPV ve Genital Siğil Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Bakırköy Ataköy'de Prof. Dr. Mustafa Özdemir tarafından tam mahremiyet ilkesiyle uygulanan lazer, kriyoterapi ve koter ile HPV genital siğil (kondilom) tedavisi.",
                    FocusKeywords = new List<string> { "hpv tedavisi istanbul", "genital siğil tedavisi bakırköy", "kondilom tedavisi dermatolog", "lazerle genital siğil" }
                }
            },

            // 4. Ben Taraması (Dermatoskopi)
            new()
            {
                Title = "Ben Taraması ve Melanositik Nevuslar",
                Slug = "ben-taramasi-dermatoskopi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 4,
                CoverImageUrl = "/images/treatments/ben-taramasi.webp",
                Summary = "Dijital ve el dermatoskopisi ile vücuttaki benlerin (melanositik nevus) detaylı incelenmesi, risk haritalaması ve deri kanserlerinin (melanom) erken tanısı.",
                HtmlContent = @"
                    <h2>Dermatoskopik Ben Taraması Neden Hayat Kurtarır?</h2>
                    <p>Vücudumuzdaki benler (melanositik nevuslar) çoğunlukla iyi huylu oluşumlardır; ancak mevcut bir benin yapısında meydana gelen asimetri, sınır düzensizliği, renk alacalanması veya çap artışı (ABCDE kriterleri) en tehlikeli deri kanseri türü olan <strong>Malign Melanom</strong> habercisi olabilir.</p>
                    <h3>Kimler Düzenli Ben Taraması Yaptırmalıdır?</h3>
                    <ul>
                        <li>Açık tenli, renkli gözlü ve güneşte kolay kızaran bireyler,</li>
                        <li>Vücudunda 50'den fazla beni veya atipik (displastik) beni bulunanlar,</li>
                        <li>Ailesinde deri kanseri veya melanom öyküsü olanlar,</li>
                        <li>Son dönemde rengi, şekli veya boyutu değişen, kanayan ya da kaşınan bir ben fark edenler.</li>
                    </ul>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Ben taraması ne sıklıkla yapılmalıdır?",
                        Answer = "Risk faktörü bulunmayan bireylerde yılda bir kez, atipik benleri olan veya ailesel risk taşıyan hastalarda ise hekimin önerisine göre 3 ila 6 ayda bir kontrol önerilir."
                    },
                    new()
                    {
                        Question = "Şüpheli bir benin alınması kansere yol açar mı?",
                        Answer = "Halk arasındaki 'bıçak değerse kötüleşir' inanışı tamamen yanlıştır. Aksine, şüpheli bir benin cerrahi olarak çıkarılıp patolojik incelemeye gönderilmesi kesin tanı ve hayat kurtarıcı erken tedavi sağlar."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Ben Taraması (Dermatoskopi) Bakırköy | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Dermatoskopik ben taraması, melanositik nevus takibi ve deri kanseri (melanom) erken tanısı için İstanbul Ataköy'de Prof. Dr. Mustafa Özdemir kliniği.",
                    FocusKeywords = new List<string> { "ben taraması istanbul", "dermatoskopi bakırköy", "melanositik nevus", "deri kanseri taraması" }
                }
            },

            // 5. Sedef Hastalığı (Psoriasis)
            new()
            {
                Title = "Sedef Hastalığı (Psoriasis) Tedavisi",
                Slug = "sedef-hastaligi-psoriasis",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 5,
                CoverImageUrl = "/images/treatments/sedef-hastaligi.webp",
                Summary = "Sedef hastalığında (psoriasis) plakları kontrol altına alan, kaşıntı ve pullanmayı gideren güncel topikal, sistemik ve biyolojik tedavi yaklaşımları.",
                HtmlContent = @"
                    <h2>Sedef Hastalığı (Psoriasis) Nedir?</h2>
                    <p><strong>Sedef hastalığı (Psoriasis)</strong>, bağışıklık sisteminin etkisiyle deri hücrelerinin normalden çok daha hızlı yenilenmesi sonucu diz, dirsek, saçlı deri ve gövdede keskin sınırlı, kızarık ve sedef rengi kepeklenmelerle (plaklarla) seyreden kronik, bulaşıcı olmayan bir deri hastalığıdır.</p>
                    <h3>Güncel Tedavi Yaklaşımlarımız</h3>
                    <p>Sedef hastalığı bulaşıcı değildir ve günümüzdeki modern dermatolojik tedavilerle lezyonların tamamen kontrol altına alınması mümkündür. Hastalığın şiddetine, tırnak ve eklem tutulumuna göre topikal tedaviler, klasik sistemik ajanlar ve hedefe yönelik yeni nesil biyolojik tedaviler kişiye özel planlanmaktadır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Sedef hastalığı bulaşıcı mıdır?",
                        Answer = "Hayır, sedef hastalığı kesinlikle bulaşıcı bir enfeksiyon hastalığı değildir; genetik yatkınlık ve bağışıklık sistemi etkileşimiyle gelişir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Sedef Hastalığı (Psoriasis) Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "İstanbul Bakırköy'de Prof. Dr. Mustafa Özdemir ile sedef hastalığı (psoriasis), saçlı deri ve tırnak sedefi için modern dermatolojik tedavi yöntemleri.",
                    FocusKeywords = new List<string> { "sedef hastalığı tedavisi", "psoriasis uzmanı istanbul", "sedef doktoru bakırköy" }
                }
            },

            // 6. Gül Hastalığı (Rosacea)
            new()
            {
                Title = "Gül Hastalığı (Rosacea) Tedavisi",
                Slug = "gul-hastaligi-rozasea",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 6,
                CoverImageUrl = "/images/treatments/gul-hastaligi-rozasea.webp",
                Summary = "Yüzde kızarıklık, ateş basması, kılcal damar belirginleşmesi ve sivilce benzeri kabarıklıklarla seyreden rozasea (gül hastalığı) için medikal ve lazer tedavileri.",
                HtmlContent = @"
                    <h2>Gül Hastalığı (Rozasea) Belirtileri ve Tedavisi</h2>
                    <p><strong>Rozasea (Gül Hastalığı)</strong>, özellikle yanaklar, burun, alın ve çenede tekrarlayan kızarıklık atakları (flushing), kalıcı kılcal damar genişlemeleri (telenjiektazi) ve iltihaplı kabarıklıklarla karakterize kronik bir yüz дерmatozudur.</p>
                    <p>Kliniğimizde rozaseayı tetikleyen faktörlerin kontrolü, Demodex parazit yoğunluğunun azaltılmasına yönelik medikal tedaviler ve kalıcı kızarıklık ile kılcal damarlara yönelik vasküler lazer uygulamaları bir arada yürütülür.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Gül hastalığında lazer tedavisi kızarıklığı geçirir mi?",
                        Answer = "Medikal kremler iltihaplı sivilce benzeri lezyonları düzeltirken, yüzeye yakın genişlemiş kılcal damarlar ve kalıcı kızarıklık (eritem) için lazer tedavileri oldukça yüksek başarı sağlar."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Gül Hastalığı (Rozasea) Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Yüz kızarıklığı ve gül hastalığı (rozasea) tedavisinde medikal protokoller ve kılcal damar lazer uygulamaları. Prof. Dr. Mustafa Özdemir - Ataköy.",
                    FocusKeywords = new List<string> { "gül hastalığı tedavisi", "rozasea tedavisi istanbul", "yüz kızarıklığı lazer bakırköy" }
                }
            },

            // 7. Ameliyatsız İp Askısı (Kozmetik Dermatoloji)
            new()
            {
                Title = "Ameliyatsız İp Askısı",
                Slug = "ameliyatsiz-ip-askisi",
                CategoryId = kozmetikId,
                CategorySlug = "kozmetik-dermatoloji",
                DisplayOrder = 1,
                CoverImageUrl = "/images/treatments/ameliyatsiz-ip-askisi.webp",
                Summary = "Cerrahi müdahale gerektirmeden yüz ovalini toparlayan, yanak ve çene hattındaki (jawline) sarkmaları gideren biyouyumlu ip askı uygulamaları.",
                HtmlContent = @"
                    <h2>Ameliyatsız İp Askısı ile Yüz Gençleştirme</h2>
                    <p>Yaş alma ve yerçekiminin etkisiyle yüzdeki bağ dokusu gevşer, yanaklar aşağı doğru yer değiştirir ve çene hattı belirginliğini kaybeder. <strong>Ameliyatsız ip askısı</strong>, cilt altına yerleştirilen eriyebilir ve biyouyumlu medikal ipler aracılığıyla sarkan dokuların anatomik vektörlere uygun şekilde yukarı taşınması işlemidir.</p>
                    <h3>Avantajları Nelerdir?</h3>
                    <ul>
                        <li>Genel anestezi ve cerrahi kesi gerektirmez, lokal anestezi altında yaklaşık 30-45 dakikada tamamlanır.</li>
                        <li>Mekanik kaldırma etkisinin yanı sıra, iplerin çevresinde yeni kolajen sentezini tetikleyerek cilt kalitesini artırır.</li>
                        <li>Doğal yüz ifadesini ve mimikleri bozmadan genç ve dinç bir görünüm sağlar.</li>
                    </ul>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Ameliyatsız ip askısı etkisini ne kadar sürdürür?",
                        Answer = "Kullanılan ipin materyaline ve kişinin cilt yapısına bağlı olarak ortalama 1,5 ila 2 yıl boyunca kaldırma ve sıkılaşma etkisi devam eder."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Ameliyatsız İp Askısı İstanbul | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Yüz sarkmaları ve yüz ovali toparlama için uzman dermatolog Prof. Dr. Mustafa Özdemir tarafından uygulanan ameliyatsız ip askısı işlemi.",
                    FocusKeywords = new List<string> { "ameliyatsız ip askısı", "iple yüz germe bakırköy", "kozmetik dermatoloji ataköy" }
                }
            },

            // 8. Kimyasal Peeling ve Karbon Peeling (Kozmetik Dermatoloji)
            new()
            {
                Title = "Kimyasal Peeling ve Karbon Peeling",
                Slug = "kimyasal-peeling",
                CategoryId = kozmetikId,
                CategorySlug = "kozmetik-dermatoloji",
                DisplayOrder = 2,
                CoverImageUrl = "/images/treatments/kimyasal-peeling.webp",
                Summary = "Gözenek sıkılaştırma, cilt tonu eşitleme, ince kırışıklıklar ve akne izlerinde kontrollü cilt soyma (kimyasal peeling) ve lazer destekli karbon peeling uygulamaları.",
                HtmlContent = @"
                    <h2>Kimyasal Peeling ve Karbon Peeling Nedir?</h2>
                    <p>Cildin yıpranmış üst tabakasının kontrollü bir şekilde arındırılarak alttan daha taze, parlak ve homojen bir deri dokusunun gelmesini sağlayan dermatolojik yenileme işlemleridir. Cilt tipine göre meyve asitleri (AHA/BHA), TCA veya enzimatik ajanlar tercih edilirken; dört mevsim uygulanabilen <strong>Karbon Peeling</strong> ile gözenek sıkılaştırma ve sebum dengeleme sağlanır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Karbon peeling işleminden sonra ciltte soyulma olur mu?",
                        Answer = "Karbon peeling cilt yüzeyinde kabuklanma veya soyulma yapmaz; öğle arası işlemi olarak da bilinir ve hemen sonrasında günlük hayata devam edilebilir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Kimyasal Peeling ve Karbon Peeling | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Bakırköy Ataköy'de leke, gözenek sıkılaştırma ve cilt yenileme için uzman dermatolog kontrolünde kimyasal peeling ve karbon peeling.",
                    FocusKeywords = new List<string> { "kimyasal peeling istanbul", "karbon peeling bakırköy", "gözenek sıkılaştırma" }
                }
            },

            // 9. Hiperhidroz (Aşırı Terleme) Tedavisi (Kozmetik Dermatoloji)
            new()
            {
                Title = "Hiperhidroz (Aşırı Terleme) Tedavisi",
                Slug = "hiperhidroz-asiri-terleme-tedavisi",
                CategoryId = kozmetikId,
                CategorySlug = "kozmetik-dermatoloji",
                DisplayOrder = 3,
                CoverImageUrl = "/images/treatments/hiperhidroz-tedavisi.webp",
                Summary = "Koltuk altı, avuç içi ve ayak tabanında sosyal yaşamı zorlaştıran aşırı terleme (hiperhidroz) probleminde hızlı ve konforlu dermatolojik tedavi.",
                HtmlContent = @"
                    <h2>Aşırı Terleme (Hiperhidroz) Nasıl Kontrol Altına Alınır?</h2>
                    <p>Vücut ısısını dengelemek için gerekenin çok üzerinde ter üretilmesi durumuna <strong>hiperhidroz</strong> adı verilir. Özellikle koltuk altı, el içi ve ayak tabanında görülen bölgesel aşırı terleme, ter bezlerine giden aşırı sinir uyarılarını geçici olarak bloke eden mikro-enjeksiyon ve medikal dermatolojik uygulamalarla 15-20 dakika içinde güvenle kontrol altına alınmaktadır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Terleme tedavisinin etkisi ne zaman başlar ve ne kadar sürer?",
                        Answer = "Uygulamadan 3-7 gün sonra terlemede belirgin azalma başlar, 2. haftada tam etkiye ulaşır ve ortalama 6-8 ay boyunca konfor sağlar."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Aşırı Terleme (Hiperhidroz) Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Koltuk altı, el ve ayak aşırı terleme (hiperhidroz) tedavisinde İstanbul Bakırköy'de Prof. Dr. Mustafa Özdemir kliniğinde kalıcı konfor.",
                    FocusKeywords = new List<string> { "aşırı terleme tedavisi", "hiperhidroz tedavisi istanbul", "koltuk altı terleme tedavisi bakırköy" }
                }
            },

            // 10. Saç Dökülmesi ve Saç Mezoterapisi (Saç Hastalıkları)
            new()
            {
                Title = "Saç Dökülmesi ve Saç Mezoterapisi",
                Slug = "sac-mezoterapisi-ve-sac-dokulmesi",
                CategoryId = sacId,
                CategorySlug = "sac-hastaliklari",
                DisplayOrder = 1,
                CoverImageUrl = "/images/treatments/sac-mezoterapisi.webp",
                Summary = "Erkek ve kadın tipi saç dökülmeleri, telogen effluvium ve saç kıran (alopesi areata) vakalarında kökleri besleyen saç mezoterapisi ve dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>Saç Dökülmesinin Dermatolojik Tanısı ve Saç Mezoterapisi</h2>
                    <p>Saç dökülmesi; genetik yatkınlık (androgenetik alopesi), demir/çinko/biotin/D vitamini eksiklikleri, tiroid hastalıkları veya stres sonrası (telogen effluvium) gelişebilir. <strong>Prof. Dr. Mustafa Özdemir</strong> tarafından yapılan trikoskopik muayene ile dökülmenin nedeni saptanır ve saç köklerinin ihtiyaç duyduğu vitamin, mineral, aminoasit ve büyüme faktörleri <strong>Saç Mezoterapisi</strong> ile doğrudan kıl foliküllerine ulaştırılır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Saç mezoterapisi kaç seans uygulanır?",
                        Answer = "Saç dökülmesinin tipine ve şiddetine göre başlangıçta 1-2 hafta arayla toplam 4 ila 8 seanslık kürler halinde planlanır."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Saç Dökülmesi ve Saç Mezoterapisi Bakırköy | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Kadın ve erkek saç dökülmesi, saç kıran ve saç mezoterapisi tedavilerinde İstanbul Ataköy'de Prof. Dr. Mustafa Özdemir uzmanlığı.",
                    FocusKeywords = new List<string> { "saç dökülmesi doktoru", "saç mezoterapisi bakırköy", "saç kıran tedavisi istanbul" }
                }
            },

            // 11. Lazerle Dövme Silme (Lazer)
            new()
            {
                Title = "Lazerle Dövme Silme",
                Slug = "dovme-silme",
                CategoryId = lazerId,
                CategorySlug = "lazer",
                DisplayOrder = 1,
                CoverImageUrl = "/images/treatments/dovme-silme.webp",
                Summary = "İstenmeyen siyah ve renkli dövmelerin (tattoo) ve kalıcı makyaj uygulamalarının cilt dokusuna zarar vermeden Q-Switched lazer teknolojisi ile silinmesi.",
                HtmlContent = @"
                    <h2>Lazerle Dövme Silme Nasıl Çalışır?</h2>
                    <p>Lazerle dövme silme işleminde, çok kısa sürede yüksek enerjili ışık atımları üreten lazer sistemleri kullanılır. Bu ışık enerjisi normal deri dokusundan geçerek yalnızca dermis tabakasındaki dövme boyası (pigment) partiküllerini hedef alır. Parçalanan mikro-pigmentler vücudun doğal savunma hücreleri (makrofajlar) tarafından lenf sistemi yoluyla uzaklaştırılır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Dövme silme işlemi iz bırakır mı?",
                        Answer = "Uzman dermatolog kontrolünde, dövmenin rengine ve derinliğine uygun dalga boyu ve enerji dozları seçildiğinde ciltte kalıcı iz kalma riski son derece düşüktür."
                    },
                    new()
                    {
                        Question = "Seans aralıkları ne kadardır?",
                        Answer = "Parçalanan boya partiküllerinin vücuttan atılması ve cildin tamamen iyileşmesi için seanslar arasında genellikle 6-8 hafta beklenir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Lazerle Dövme Silme İstanbul | Prof. Dr. Mustafa Özdemir - Bakırköy",
                    MetaDescription = "Bakırköy Ataköy'de uzman dermatolog Prof. Dr. Mustafa Özdemir kontrolünde iz bırakmayan güvenli lazerle dövme silme ve kalıcı makyaj silme.",
                    FocusKeywords = new List<string> { "lazerle dövme silme", "dövme silme istanbul", "dövme sildirme bakırköy" }
                }
            },

            // 12. Kılcal Damar ve Varis Lazer Tedavisi (Lazer)
            new()
            {
                Title = "Kılcal Damar, Varis ve Sivilce İzleri Lazer Tedavisi",
                Slug = "kilcal-damar-ve-varis-lazer-tedavisi",
                CategoryId = lazerId,
                CategorySlug = "lazer",
                DisplayOrder = 2,
                CoverImageUrl = "/images/treatments/kilcal-damar-lazer.webp",
                Summary = "Yüz, burun kenarı ve bacaklardaki kılcal damar genişlemeleri (telenjiektazi), sivilce izleri ve cilt yenilemede hedefe yönelik lazer uygulamaları.",
                HtmlContent = @"
                    <h2>Kılcal Damar ve Cilt Yenilemede Lazer Teknolojisi</h2>
                    <p>Yüzde burun kanatları ve yanaklarda veya bacaklarda ince kırmızı-mor çizgiler halinde görülen kılcal damar genişlemeleri, damar içindeki oksihemoglobin maddesini hedef alan vasküler lazerlerle çevre dokuya hasar vermeden koagüle edilerek yok edilir. Aynı zamanda fraksiyonel lazer protokollerimizle sivilce izleri (akne skarları), gözenek genişliği ve cilt çatlaklarında kolajen üretimi yeniden tetiklenir.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Yüzdeki kılcal damarlar kaç seansta geçer?",
                        Answer = "İnce burun kenarı ve yanak kılcal damarlarında çoğu zaman 1 ila 3 seans arasında oldukça tatmin edici sonuçlar elde edilmektedir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Kılcal Damar ve Sivilce İzi Lazer Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Yüz ve bacak kılcal damar tedavisi, sivilce izleri ve lazerle cilt yenileme için İstanbul Bakırköy Ataköy'de Prof. Dr. Mustafa Özdemir kliniği.",
                    FocusKeywords = new List<string> { "kılcal damar lazer tedavisi", "yüzdeki kılcal damarlar", "sivilce izi lazer tedavisi bakırköy" }
                }
            }
        };

        await _context.Treatments.InsertManyAsync(treatments, cancellationToken: cancellationToken);
    }

    private async Task SeedBlogsAsync(CancellationToken cancellationToken)
    {
        if (await _context.BlogPosts.Find(_ => true).AnyAsync(cancellationToken))
            return;

        var blogs = new List<BlogPost>
        {
            new()
            {
                Title = "Güneş Lekeleri ve Melazmadan Korunmak İçin Dermatolojik Öneriler",
                Slug = "gunes-lekeleri-ve-melazmadan-korunmak-icin-oneriler",
                Summary = "Cilt lekelerinin oluşum mekanizması, doğru güneş koruyucu seçimi ve sonbahar-kış döneminde uygulanan lazerle leke tedavisi hakkında bilmeniz gerekenler.",
                CoverImageUrl = "/images/blog/gunes-lekeleri-korunma.webp",
                Author = "Prof. Dr. Mustafa Özdemir",
                Tags = new List<string> { "Leke Tedavisi", "Güneş Koruyucu", "Melazma", "Dermatoloji" },
                HtmlContent = @"
                    <h2>Cilt Lekeleri Neden Tekrarlar?</h2>
                    <p>Güneş lekeleri ve melazma, melanosit hücrelerinin sadece UV ışınlarına değil aynı zamanda görünür ışığa (mavi ışık) ve ısıya karşı aşırı duyarlı hale gelmesiyle oluşur. Bu nedenle leke tedavisinde başarı, doğru klinik lazer uygulaması kadar yıl boyu doğru güneşten korunma alışkanlığına bağlıdır.</p>
                    <h3>Güneş Koruyucu Seçerken Nelere Dikkat Edilmeli?</h3>
                    <p>Lekeye eğilimli ciltlerde yalnızca UVB koruması (SPF 50+) yeterli değildir; mutlaka geniş spektrumlu UVA koruması ve demir oksit içeren renkli (mineral filtreli) koruyucular tercih edilmelidir.</p>",
                Seo = new SeoMetadata
                {
                    MetaTitle = "Güneş Lekeleri ve Melazmadan Korunma Rehberi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Prof. Dr. Mustafa Özdemir'den güneş lekeleri, melazma ve doğru güneş koruyucu seçimi hakkında bilimsel dermatolojik tavsiyeler.",
                    FocusKeywords = new List<string> { "güneş lekeleri", "melazma korunma", "leke için güneş kremi" },
                    SchemaType = "MedicalScholarlyArticle"
                }
            },
            new()
            {
                Title = "Vücudunuzdaki Benlerde Hangi Değişiklikler Ciddiye Alınmalı? (ABCDE Kuralı)",
                Slug = "benlerde-hangi-degisiklikler-ciddiye-alinmali-abcde-kurali",
                Summary = "Malign melanom erken tanısında hayat kurtaran ABCDE kuralı ve yıllık dermatoskopik ben taramasının önemi.",
                CoverImageUrl = "/images/blog/ben-taramasi-abcde.webp",
                Author = "Prof. Dr. Mustafa Özdemir",
                Tags = new List<string> { "Ben Taraması", "Dermatoskopi", "Deri Kanseri", "Melanom" },
                HtmlContent = @"
                    <h2>Benlerinizi Kontrol Ederken ABCDE Kuralı</h2>
                    <p>Derimizdeki benlerin takibinde uluslararası dermatoloji kılavuzlarının önerdiği 5 temel kriter bulunmaktadır:</p>
                    <ul>
                        <li><strong>A (Asymmetry - Asimetri):</strong> Benin bir yarısının diğer yarısına benzememesi.</li>
                        <li><strong>B (Border - Sınır):</strong> Kenarlarının girintili çıkıntılı, düzensiz veya belirsiz olması.</li>
                        <li><strong>C (Color - Renk):</strong> Tek bir ton yerine siyah, koyu kahve, açık kahve, kırmızı veya beyaz gibi birden fazla renk içermesi.</li>
                        <li><strong>D (Diameter - Çap):</strong> Çapının 6 mm'den büyük olması veya hızla büyümesi.</li>
                        <li><strong>E (Evolution - Değişim):</strong> Zaman içinde şeklinde, kabarıklığında değişim, kanama veya kaşıntı başlaması.</li>
                    </ul>",
                Seo = new SeoMetadata
                {
                    MetaTitle = "Benlerde ABCDE Kuralı ve Dermatoskopi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Vücuttaki benlerin takibinde ABCDE kuralı nedir? Deri kanseri erken tanısında dermatoskopik ben taramasının önemi.",
                    FocusKeywords = new List<string> { "benlerde abcde kuralı", "ben taraması", "melanom belirtileri" },
                    SchemaType = "MedicalScholarlyArticle"
                }
            }
        };

        await _context.BlogPosts.InsertManyAsync(blogs, cancellationToken: cancellationToken);
    }
}

