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

    private static readonly Dictionary<string, string> TreatmentImageMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["lazerle-leke-tedavisi"] = "/uploads/treatments/lazerle-leke-tedavisi.jpg",
        ["akne-sivilce-tedavisi"] = "/uploads/treatments/akne-sivilce-tedavisi.png",
        ["hpv-genital-sigil-tedavisi"] = "/uploads/treatments/hpv-genital-sigil-tedavisi.png",
        ["ben-taramasi-dermatoskopi"] = "/uploads/corporate/doctor-portrait.jpg",
        ["sedef-hastaligi-psoriasis"] = "/uploads/treatments/sedef-hastaligi-psoriasis.png",
        ["gul-hastaligi-rozasea"] = "/uploads/treatments/gul-hastaligi-rozasea.png",
        ["egzama-tedavisi"] = "/uploads/treatments/egzama-tedavisi.png",
        ["zona-gece-yanigi-tedavisi"] = "/uploads/treatments/zona-gece-yanigi-tedavisi.png",
        ["liken-planus-tedavisi"] = "/uploads/treatments/liken-planus-tedavisi.png",
        ["seboreik-dermatit-tedavisi"] = "/uploads/treatments/seboreik-dermatit-tedavisi.png",
        ["mantar-hastaliklari-tedavisi"] = "/uploads/treatments/mantar-hastaliklari-tedavisi.png",
        ["tirnak-hastaliklari-tedavisi"] = "/uploads/treatments/tirnak-hastaliklari-tedavisi.png",
        ["ucuk-herpes-tedavisi"] = "/uploads/treatments/ucuk-herpes-tedavisi.png",
        ["cocuk-deri-hastaliklari"] = "/uploads/treatments/cocuk-deri-hastaliklari.png",
        ["ameliyatsiz-ip-askisi"] = "/uploads/corporate/hero-showroom.jpg",
        ["kimyasal-peeling"] = "/uploads/treatments/lazerle-leke-tedavisi.jpg",
        ["hiperhidroz-asiri-terleme-tedavisi"] = "/uploads/corporate/doctor-portrait.jpg",
        ["sac-mezoterapisi-ve-sac-dokulmesi"] = "/uploads/treatments/seboreik-dermatit-tedavisi.png",
        ["dovme-silme"] = "/uploads/treatments/dovme-silme.jpg",
        ["kilcal-damar-ve-varis-lazer-tedavisi"] = "/uploads/treatments/gul-hastaligi-rozasea.png"
    };

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
        var existingAdmin = await _context.AdminUsers
            .Find(x => x.Email == "mustafaozdemir@yahoo.com")
            .FirstOrDefaultAsync(cancellationToken);

        if (existingAdmin is not null)
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
        var existing = await _context.SiteSettings.Find(_ => true).FirstOrDefaultAsync(cancellationToken);
        if (existing is not null)
        {
            return;
        }

        var settings = new SiteSettings
        {
            ClinicName = "Prof. Dr. Mustafa Özdemir Dermatoloji & Lazer Kliniği",
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
                Title = "Lazer",
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
        var dermatolojiId = categories["dermatoloji"].Id;
        var kozmetikId = categories["kozmetik-dermatoloji"].Id;
        var sacId = categories["sac-hastaliklari"].Id;
        var lazerId = categories["lazer"].Id;

        var seedList = BuildInitialTreatments(dermatolojiId, kozmetikId, sacId, lazerId);

        var existingTreatments = await _context.Treatments.Find(_ => true).ToListAsync(cancellationToken);
        if (existingTreatments.Count == 0)
        {
            await _context.Treatments.InsertManyAsync(seedList, cancellationToken: cancellationToken);
            return;
        }

        // Update existing records that have empty or legacy (/images/...) CoverImageUrl
        foreach (var existing in existingTreatments)
        {
            if (TreatmentImageMap.TryGetValue(existing.Slug, out var mappedImageUrl))
            {
                if (string.IsNullOrWhiteSpace(existing.CoverImageUrl) ||
                    existing.CoverImageUrl.StartsWith("/images/", StringComparison.OrdinalIgnoreCase))
                {
                    existing.CoverImageUrl = mappedImageUrl;
                    existing.UpdatedAt = DateTime.UtcNow;
                    await _context.Treatments.ReplaceOneAsync(
                        x => x.Id == existing.Id,
                        existing,
                        cancellationToken: cancellationToken);
                }
            }
        }

        // Also insert any newly added seed treatments whose slug does not exist yet
        var existingSlugs = existingTreatments.Select(x => x.Slug).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var missingTreatments = seedList.Where(x => !existingSlugs.Contains(x.Slug)).ToList();
        if (missingTreatments.Count > 0)
        {
            await _context.Treatments.InsertManyAsync(missingTreatments, cancellationToken: cancellationToken);
        }
    }

    private static List<Treatment> BuildInitialTreatments(
        string dermatolojiId,
        string kozmetikId,
        string sacId,
        string lazerId)
    {
        return new List<Treatment>
        {
            // 1. Lazerle Leke Tedavisi
            new()
            {
                Title = "Lazerle Leke Tedavisi",
                Slug = "lazerle-leke-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 1,
                CoverImageUrl = "/uploads/treatments/lazerle-leke-tedavisi.jpg",
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
                    </ul>",
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
                CoverImageUrl = "/uploads/treatments/akne-sivilce-tedavisi.png",
                Summary = "Ergenlik ve yetişkinlik dönemi akne (sivilce) problemlerinde kalıcı iz oluşumunu engelleyen medikal, topikal ve lazer destekli bütüncül dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>Akne (Sivilce) Neden Oluşur ve Nasıl Tedavi Edilir?</h2>
                    <p><strong>Akne vulgaris</strong>, yağ bezlerinin (sebase bezler) aşırı sebum üretimi, gözeneklerin tıkanması (komedon oluşumu) ve <em>Cutibacterium acnes</em> bakterisinin çoğalmasıyla seyreden kronik inflamatuar bir deri hastalığıdır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Sivilce tedavisinde ne zaman sonuç alınmaya başlanır?",
                        Answer = "Deri yenilenme döngüsü dikkate alındığında, düzenli medikal tedaviyle ilk belirgin iyileşmeler 4-6. haftalarda başlar; tam kontrol genellikle 3-6 ay sürer."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Akne (Sivilce) Tedavisi Bakırköy | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Ergenlik ve yetişkin sivilceleri, kistik akne ve sivilce izleri için Prof. Dr. Mustafa Özdemir kliniğinde bilimsel dermatolojik akne tedavisi.",
                    FocusKeywords = new List<string> { "akne tedavisi istanbul", "sivilce doktoru bakırköy" }
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
                CoverImageUrl = "/uploads/treatments/hpv-genital-sigil-tedavisi.png",
                Summary = "Human Papilloma Virüsü (HPV) kaynaklı genital siğil (kondilom) lezyonlarında hasta mahremiyetine tam özen gösteren, hızlı ve nüks riskini azaltan dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>HPV ve Genital Siğil (Kondilom) Nedir?</h2>
                    <p><strong>Human Papilloma Virüsü (HPV)</strong>, cilt ve mukozalarda enfeksiyona yol açan yaygın bir virüstür. Kliniğimizde hasta gizliliği ve mahremiyeti en üst düzeyde tutularak kriyoterapi, elektrokoterizasyon ve lazer ablasyon yöntemleri uygulanır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Genital siğil işlemi sırasında ağrı hissedilir mi?",
                        Answer = "Uygulama öncesinde sürülen anestezik kremler veya lokal anestezi sayesinde işlem sırasında ağrı hissedilmez ve hasta aynı gün günlük yaşantısına dönebilir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "HPV ve Genital Siğil Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Bakırköy Ataköy'de Prof. Dr. Mustafa Özdemir tarafından tam mahremiyet ilkesiyle uygulanan lazer, kriyoterapi ve koter ile HPV genital siğil tedavisi.",
                    FocusKeywords = new List<string> { "hpv tedavisi istanbul", "genital siğil tedavisi bakırköy" }
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
                CoverImageUrl = "/uploads/corporate/doctor-portrait.jpg",
                Summary = "Dijital ve el dermatoskopisi ile vücuttaki benlerin (melanositik nevus) detaylı incelenmesi, risk haritalaması ve deri kanserlerinin (melanom) erken tanısı.",
                HtmlContent = @"
                    <h2>Dermatoskopik Ben Taraması Neden Hayat Kurtarır?</h2>
                    <p>Vücudumuzdaki benler çoğunlukla iyi huylu oluşumlardır; ancak mevcut bir benin yapısında meydana gelen asimetri, sınır düzensizliği, renk alacalanması veya çap artışı (ABCDE kriterleri) <strong>Malign Melanom</strong> habercisi olabilir.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Ben taraması ne sıklıkla yapılmalıdır?",
                        Answer = "Risk faktörü bulunmayan bireylerde yılda bir kez, atipik benleri olan veya ailesel risk taşıyan hastalarda ise 3 ila 6 ayda bir kontrol önerilir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Ben Taraması (Dermatoskopi) Bakırköy | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Dermatoskopik ben taraması, melanositik nevus takibi ve deri kanseri (melanom) erken tanısı için İstanbul Ataköy'de Prof. Dr. Mustafa Özdemir kliniği.",
                    FocusKeywords = new List<string> { "ben taraması istanbul", "dermatoskopi bakırköy" }
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
                CoverImageUrl = "/uploads/treatments/sedef-hastaligi-psoriasis.png",
                Summary = "Sedef hastalığında (psoriasis) plakları kontrol altına alan, kaşıntı ve pullanmayı gideren güncel topikal, sistemik ve biyolojik tedavi yaklaşımları.",
                HtmlContent = @"
                    <h2>Sedef Hastalığı (Psoriasis) Nedir?</h2>
                    <p><strong>Sedef hastalığı (Psoriasis)</strong>, deri hücrelerinin normalden hızlı yenilenmesi sonucu diz, dirsek, saçlı deri ve gövdede sedef rengi kepeklenmelerle seyreden kronik, bulaşıcı olmayan bir deri hastalığıdır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Sedef hastalığı bulaşıcı mıdır?",
                        Answer = "Hayır, sedef hastalığı kesinlikle bulaşıcı değildir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Sedef Hastalığı (Psoriasis) Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "İstanbul Bakırköy'de Prof. Dr. Mustafa Özdemir ile sedef hastalığı (psoriasis) için modern dermatolojik tedavi yöntemleri.",
                    FocusKeywords = new List<string> { "sedef hastalığı tedavisi", "psoriasis uzmanı istanbul" }
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
                CoverImageUrl = "/uploads/treatments/gul-hastaligi-rozasea.png",
                Summary = "Yüzde kızarıklık, ateş basması, kılcal damar belirginleşmesi ve sivilce benzeri kabarıklıklarla seyreden rozasea (gül hastalığı) için medikal ve lazer tedavileri.",
                HtmlContent = @"
                    <h2>Gül Hastalığı (Rozasea) Belirtileri ve Tedavisi</h2>
                    <p><strong>Rozasea (Gül Hastalığı)</strong>, özellikle yanaklar, burun, alın ve çenede tekrarlayan kızarıklık atakları ve kalıcı kılcal damar genişlemeleriyle karakterize kronik bir yüz dermatozudur.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Gül hastalığında lazer tedavisi kızarıklığı geçirir mi?",
                        Answer = "Yüzeye yakın genişlemiş kılcal damarlar ve kalıcı kızarıklık (eritem) için vasküler lazer tedavileri yüksek başarı sağlar."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Gül Hastalığı (Rozasea) Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Yüz kızarıklığı ve gül hastalığı (rozasea) tedavisinde medikal protokoller ve kılcal damar lazer uygulamaları.",
                    FocusKeywords = new List<string> { "gül hastalığı tedavisi", "rozasea tedavisi istanbul" }
                }
            },

            // 7. Egzama (Atopik ve Kontakt Dermatit)
            new()
            {
                Title = "Egzama (Dermatit) Tedavisi",
                Slug = "egzama-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 7,
                CoverImageUrl = "/uploads/treatments/egzama-tedavisi.png",
                Summary = "Atopik dermatit, alerjik kontakt dermatit ve el egzamalarında kaşıntı, kızarıklık ve kuruluğu gideren deri bariyeri onarıcı dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>Egzama (Dermatit) Nedir ve Nasıl Tedavi Edilir?</h2>
                    <p><strong>Egzama</strong>, deri bariyerinin bozulması ve bağışıklık sisteminin çevresel alerjenlere aşırı yanıt vermesi sonucu kızarıklık, şiddetli kaşıntı, kuruluk ve su dolu kabarcıklarla seyreden inflamatuar bir deri hastalığıdır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Egzama tamamen kontrol altına alınabilir mi?",
                        Answer = "Tetikleyici alerjenlerin tespiti, uygun medikal kremler ve düzenli bariyer onarıcı nemlendirici protokolleriyle ataklar tamamen kontrol altına alınabilir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Egzama (Dermatit) Tedavisi Bakırköy | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Atopik egzama, el egzaması ve alerjik dermatit tedavisi için İstanbul Bakırköy Ataköy'de Prof. Dr. Mustafa Özdemir kliniği.",
                    FocusKeywords = new List<string> { "egzama tedavisi", "atopik dermatit doktoru" }
                }
            },

            // 8. Gece Yanığı (Zona / Herpes Zoster)
            new()
            {
                Title = "Gece Yanığı (Zona) Tedavisi",
                Slug = "zona-gece-yanigi-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 8,
                CoverImageUrl = "/uploads/treatments/zona-gece-yanigi-tedavisi.png",
                Summary = "Suçiçeği virüsünün yeniden aktifleşmesiyle oluşan ağrılı ve su dolu döküntülerle seyreden zona (gece yanığı) hastalığında erken antiviral ve ağrı tedavisi.",
                HtmlContent = @"
                    <h2>Zona (Gece Yanığı) Nedir?</h2>
                    <p><strong>Zona (Herpes Zoster)</strong>, çocuklukta geçirilen suçiçeği virüsünün sinir köklerinde sessiz kaldıktan sonra bağışıklığın düştüğü dönemlerde tek taraflı kuşak tarzında ağrılı döküntülerle yeniden aktifleşmesidir. İlk 72 saat içinde başlanan antiviral tedavi, kalıcı sinir ağrısını (postherpetik nevralji) önlemede kritik önem taşır.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Gece Yanığı (Zona) Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Zona (gece yanığı) döküntü ve sinir ağrısı tedavisinde erken dermatolojik müdahale.",
                    FocusKeywords = new List<string> { "zona tedavisi", "gece yanığı doktoru" }
                }
            },

            // 9. Liken Planus Tedavisi
            new()
            {
                Title = "Liken Planus Tedavisi",
                Slug = "liken-planus-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 9,
                CoverImageUrl = "/uploads/treatments/liken-planus-tedavisi.png",
                Summary = "Deri, ağız içi mukozası, tırnak ve saçlı deriyi etkileyebilen morumsu, parlak ve kaşıntılı döküntülerle seyreden liken planus hastalığının tanı ve tedavisi.",
                HtmlContent = @"
                    <h2>Liken Planus Nedir?</h2>
                    <p><strong>Liken Planus</strong>, el bilekleri, ayak bilekleri, gövde ve ağız içi mukozasında kaşıntılı, morumsu-kırmızı lezyonlarla seyreden otoimmün karakterli bir deri ve mukoza hastalığıdır.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Liken Planus Tedavisi İstanbul | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Deri ve ağız içi liken planus hastalığı tanı ve tedavisinde Prof. Dr. Mustafa Özdemir kliniği.",
                    FocusKeywords = new List<string> { "liken planus tedavisi", "ağız içi liken planus" }
                }
            },

            // 10. Seboreik Dermatit Tedavisi
            new()
            {
                Title = "Seboreik Dermatit Tedavisi",
                Slug = "seboreik-dermatit-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 10,
                CoverImageUrl = "/uploads/treatments/seboreik-dermatit-tedavisi.png",
                Summary = "Saçlı deri, kaşlar, burun kenarları ve kulak arkasında yağlı kepeklenme ve kızarıklıkla seyreden seboreik dermatit (yağlı egzama) kontrol protokolleri.",
                HtmlContent = @"
                    <h2>Seboreik Dermatit (Yağlı Egzama) Nedir?</h2>
                    <p><strong>Seboreik dermatit</strong>, yağ bezlerinin yoğun olduğu saçlı deri, yüz T bölgesi ve göğüs ortasında kızarıklık, sarımsı yağlı kabuklanma ve kepeklenmeyle seyreden kronik bir tablodur.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Seboreik Dermatit Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Saçlı deri ve yüzde seboreik dermatit (yağlı egzama) tedavisi.",
                    FocusKeywords = new List<string> { "seboreik dermatit tedavisi", "yağlı egzama" }
                }
            },

            // 11. Mantar Hastalıkları Tedavisi
            new()
            {
                Title = "Mantar Hastalıkları Tedavisi",
                Slug = "mantar-hastaliklari-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 11,
                CoverImageUrl = "/uploads/treatments/mantar-hastaliklari-tedavisi.png",
                Summary = "Ayak, kasık, gövde, saçlı deri ve tırnaklarda görülen yüzeyel mantar enfeksiyonlarının (tinea, kandidiyazis, pitriyazis versikolor) mikroskobik tanı ve tedavisi.",
                HtmlContent = @"
                    <h2>Deri ve Tırnak Mantarı Enfeksiyonları</h2>
                    <p>Mantar enfeksiyonları direkt mikroskobik inceleme (native preparat) ve kültür ile doğru teşhis edildiğinde hedefe yönelik topikal ve sistemik antifungal ajanlarla kalıcı olarak tedavi edilir.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Deri ve Tırnak Mantarı Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Ayak, kasık, gövde ve tırnak mantarı hastalıklarında dermatolojik tanı ve tedavi.",
                    FocusKeywords = new List<string> { "mantar hastalıkları tedavisi", "deri mantarı doktoru" }
                }
            },

            // 12. Tırnak Hastalıkları Tedavisi
            new()
            {
                Title = "Tırnak Hastalıkları Tedavisi",
                Slug = "tirnak-hastaliklari-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 12,
                CoverImageUrl = "/uploads/treatments/tirnak-hastaliklari-tedavisi.png",
                Summary = "Tırnak mantarı (onikomikoz), tırnak batması, tırnak sedefi, tırnak kırılmaları ve tırnak altı renk değişimlerinin (melanonişi) dermatoskopik tanı ve tedavisi.",
                HtmlContent = @"
                    <h2>Tırnak Hastalıkları Nelerdir?</h2>
                    <p>Tırnaklardaki şekil ve renk bozuklukları yalnızca mantar kaynaklı olmayabilir; sedef hastalığı, liken planus, sistemik vitamin eksiklikleri veya tırnak yatağı tümörleri dermatoskopik muayene ile ayırt edilerek tedavi planlanır.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Tırnak Hastalıkları ve Tırnak Mantarı Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Tırnak mantarı, tırnak batması ve tırnak sedefi tedavileri.",
                    FocusKeywords = new List<string> { "tırnak hastalıkları doktoru", "tırnak mantarı tedavisi" }
                }
            },

            // 13. Uçuk (Herpes Simpleks) Tedavisi
            new()
            {
                Title = "Uçuk (Herpes Simpleks) Tedavisi",
                Slug = "ucuk-herpes-tedavisi",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 13,
                CoverImageUrl = "/uploads/treatments/ucuk-herpes-tedavisi.png",
                Summary = "Dudak çevresi (oral herpes) ve genital bölgede tekrarlayan uçuk (Herpes Simpleks Virüsü) enfeksiyonlarında atak tedavisi ve baskılayıcı koruma protokolleri.",
                HtmlContent = @"
                    <h2>Tekrarlayan Uçuk (Herpes) Enfeksiyonları</h2>
                    <p>Herpes Simpleks Tip 1 ve Tip 2 virüslerinin neden olduğu dudak ve genital bölge uçuklarında erken antiviral tedavi ile iyileşme süresi kısaltılır; sık tekrarlayan vakalarda süpresyon (baskılama) protokolü uygulanır.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Uçuk (Herpes Simpleks) Tedavisi | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Dudak ve genital uçuk (herpes) enfeksiyonlarında dermatolojik tedavi.",
                    FocusKeywords = new List<string> { "uçuk tedavisi", "genital herpes tedavisi" }
                }
            },

            // 14. Çocukta Deri Hastalıkları (Pediatrik Dermatoloji)
            new()
            {
                Title = "Çocukta Deri Hastalıkları",
                Slug = "cocuk-deri-hastaliklari",
                CategoryId = dermatolojiId,
                CategorySlug = "dermatoloji",
                DisplayOrder = 14,
                CoverImageUrl = "/uploads/treatments/cocuk-deri-hastaliklari.png",
                Summary = "Bebek ve çocuklarda görülen atopik dermatit (bebek egzaması), bez dermatiti, molluskum kontagiozum, siğiller, doğum lekeleri (hemanjiyom) ve viral döküntülerin tedavisi.",
                HtmlContent = @"
                    <h2>Pediatrik Dermatoloji (Çocuk Cilt Sağlığı)</h2>
                    <p>Çocukların deri yapısı yetişkinlere göre çok daha ince ve hassastır. Bebeklik egzaması, molluskum, siğiller ve doğum lekeleri çocuk cildine uygun güvenli protokollerle takip ve tedavi edilir.</p>",
                Faqs = new List<FaqItem>(),
                Seo = new SeoMetadata
                {
                    MetaTitle = "Çocukta Deri Hastalıkları (Pediatrik Dermatoloji) | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Bebek ve çocuklarda egzama, alerji, siğil ve doğum lekeleri için uzman dermatolog muayenesi.",
                    FocusKeywords = new List<string> { "çocuk dermatoloji istanbul", "bebek egzaması tedavisi" }
                }
            },

            // 15. Ameliyatsız İp Askısı (Kozmetik Dermatoloji)
            new()
            {
                Title = "Ameliyatsız İp Askısı",
                Slug = "ameliyatsiz-ip-askisi",
                CategoryId = kozmetikId,
                CategorySlug = "kozmetik-dermatoloji",
                DisplayOrder = 1,
                CoverImageUrl = "/uploads/corporate/hero-showroom.jpg",
                Summary = "Cerrahi müdahale gerektirmeden yüz ovalini toparlayan, yanak ve çene hattındaki (jawline) sarkmaları gideren biyouyumlu ip askı uygulamaları.",
                HtmlContent = @"
                    <h2>Ameliyatsız İp Askısı ile Yüz Gençleştirme</h2>
                    <p>Cilt altına yerleştirilen eriyebilir ve biyouyumlu medikal ipler aracılığıyla sarkan dokuların anatomik vektörlere uygun şekilde yukarı taşınması işlemidir.</p>",
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
                    FocusKeywords = new List<string> { "ameliyatsız ip askısı", "iple yüz germe bakırköy" }
                }
            },

            // 16. Kimyasal Peeling ve Karbon Peeling (Kozmetik Dermatoloji)
            new()
            {
                Title = "Kimyasal Peeling ve Karbon Peeling",
                Slug = "kimyasal-peeling",
                CategoryId = kozmetikId,
                CategorySlug = "kozmetik-dermatoloji",
                DisplayOrder = 2,
                CoverImageUrl = "/uploads/treatments/lazerle-leke-tedavisi.jpg",
                Summary = "Gözenek sıkılaştırma, cilt tonu eşitleme, ince kırışıklıklar ve akne izlerinde kontrollü cilt soyma (kimyasal peeling) ve lazer destekli karbon peeling uygulamaları.",
                HtmlContent = @"
                    <h2>Kimyasal Peeling ve Karbon Peeling Nedir?</h2>
                    <p>Cildin yıpranmış üst tabakasının kontrollü bir şekilde arındırılarak alttan daha taze, parlak ve homojen bir deri dokusunun gelmesini sağlayan dermatolojik yenileme işlemleridir.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Karbon peeling işleminden sonra ciltte soyulma olur mu?",
                        Answer = "Karbon peeling cilt yüzeyinde kabuklanma veya soyulma yapmaz; hemen sonrasında günlük hayata devam edilebilir."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Kimyasal Peeling ve Karbon Peeling | Prof. Dr. Mustafa Özdemir",
                    MetaDescription = "Bakırköy Ataköy'de leke, gözenek sıkılaştırma ve cilt yenileme için uzman dermatolog kontrolünde kimyasal peeling ve karbon peeling.",
                    FocusKeywords = new List<string> { "kimyasal peeling istanbul", "karbon peeling bakırköy" }
                }
            },

            // 17. Hiperhidroz (Aşırı Terleme) Tedavisi (Kozmetik Dermatoloji)
            new()
            {
                Title = "Hiperhidroz (Aşırı Terleme) Tedavisi",
                Slug = "hiperhidroz-asiri-terleme-tedavisi",
                CategoryId = kozmetikId,
                CategorySlug = "kozmetik-dermatoloji",
                DisplayOrder = 3,
                CoverImageUrl = "/uploads/corporate/doctor-portrait.jpg",
                Summary = "Koltuk altı, avuç içi ve ayak tabanında sosyal yaşamı zorlaştıran aşırı terleme (hiperhidroz) probleminde hızlı ve konforlu dermatolojik tedavi.",
                HtmlContent = @"
                    <h2>Aşırı Terleme (Hiperhidroz) Nasıl Kontrol Altına Alınır?</h2>
                    <p>Özellikle koltuk altı, el içi ve ayak tabanında görülen bölgesel aşırı terleme, ter bezlerine giden aşırı sinir uyarılarını geçici olarak bloke eden mikro-enjeksiyon ve medikal dermatolojik uygulamalarla 15-20 dakika içinde güvenle kontrol altına alınmaktadır.</p>",
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
                    FocusKeywords = new List<string> { "aşırı terleme tedavisi", "hiperhidroz tedavisi istanbul" }
                }
            },

            // 18. Saç Dökülmesi ve Saç Mezoterapisi (Saç Hastalıkları)
            new()
            {
                Title = "Saç Dökülmesi ve Saç Mezoterapisi",
                Slug = "sac-mezoterapisi-ve-sac-dokulmesi",
                CategoryId = sacId,
                CategorySlug = "sac-hastaliklari",
                DisplayOrder = 1,
                CoverImageUrl = "/uploads/treatments/seboreik-dermatit-tedavisi.png",
                Summary = "Erkek ve kadın tipi saç dökülmeleri, telogen effluvium ve saç kıran (alopesi areata) vakalarında kökleri besleyen saç mezoterapisi ve dermatolojik tedaviler.",
                HtmlContent = @"
                    <h2>Saç Dökülmesinin Dermatolojik Tanısı ve Saç Mezoterapisi</h2>
                    <p><strong>Prof. Dr. Mustafa Özdemir</strong> tarafından yapılan trikoskopik muayene ile dökülmenin nedeni saptanır ve saç köklerinin ihtiyaç duyduğu vitamin, mineral, aminoasit ve büyüme faktörleri <strong>Saç Mezoterapisi</strong> ile doğrudan kıl foliküllerine ulaştırılır.</p>",
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
                    FocusKeywords = new List<string> { "saç dökülmesi doktoru", "saç mezoterapisi bakırköy" }
                }
            },

            // 19. Lazerle Dövme Silme (Lazer)
            new()
            {
                Title = "Lazerle Dövme Silme",
                Slug = "dovme-silme",
                CategoryId = lazerId,
                CategorySlug = "lazer",
                DisplayOrder = 1,
                CoverImageUrl = "/uploads/treatments/dovme-silme.jpg",
                Summary = "İstenmeyen siyah ve renkli dövmelerin (tattoo) ve kalıcı makyaj uygulamalarının cilt dokusuna zarar vermeden Q-Switched lazer teknolojisi ile silinmesi.",
                HtmlContent = @"
                    <h2>Lazerle Dövme Silme Nasıl Çalışır?</h2>
                    <p>Lazerle dövme silme işleminde, çok kısa sürede yüksek enerjili ışık atımları üreten lazer sistemleri kullanılır. Bu ışık enerjisi normal deri dokusundan geçerek yalnızca dermis tabakasındaki dövme boyası partiküllerini hedef alır.</p>",
                Faqs = new List<FaqItem>
                {
                    new()
                    {
                        Question = "Dövme silme işlemi iz bırakır mı?",
                        Answer = "Uzman dermatolog kontrolünde, dövmenin rengine ve derinliğine uygun dalga boyu seçildiğinde ciltte kalıcı iz kalma riski son derece düşüktür."
                    }
                },
                Seo = new SeoMetadata
                {
                    MetaTitle = "Lazerle Dövme Silme İstanbul | Prof. Dr. Mustafa Özdemir - Bakırköy",
                    MetaDescription = "Bakırköy Ataköy'de uzman dermatolog Prof. Dr. Mustafa Özdemir kontrolünde iz bırakmayan güvenli lazerle dövme silme.",
                    FocusKeywords = new List<string> { "lazerle dövme silme", "dövme silme istanbul" }
                }
            },

            // 20. Kılcal Damar ve Varis Lazer Tedavisi (Lazer)
            new()
            {
                Title = "Kılcal Damar, Varis ve Sivilce İzleri Lazer Tedavisi",
                Slug = "kilcal-damar-ve-varis-lazer-tedavisi",
                CategoryId = lazerId,
                CategorySlug = "lazer",
                DisplayOrder = 2,
                CoverImageUrl = "/uploads/treatments/gul-hastaligi-rozasea.png",
                Summary = "Yüz, burun kenarı ve bacaklardaki kılcal damar genişlemeleri (telenjiektazi), sivilce izleri ve cilt yenilemede hedefe yönelik lazer uygulamaları.",
                HtmlContent = @"
                    <h2>Kılcal Damar ve Cilt Yenilemede Lazer Teknolojisi</h2>
                    <p>Yüzde burun kanatları ve yanaklarda veya bacaklarda ince kırmızı-mor çizgiler halinde görülen kılcal damar genişlemeleri, vasküler lazerlerle çevre dokuya hasar vermeden koagüle edilerek yok edilir.</p>",
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
                    FocusKeywords = new List<string> { "kılcal damar lazer tedavisi", "yüzdeki kılcal damarlar" }
                }
            }
        };
    }

    private async Task SeedBlogsAsync(CancellationToken cancellationToken)
    {
        var existingBlogs = await _context.BlogPosts.Find(_ => true).ToListAsync(cancellationToken);
        if (existingBlogs.Count > 0)
        {
            foreach (var b in existingBlogs)
            {
                if (string.IsNullOrWhiteSpace(b.CoverImageUrl) || b.CoverImageUrl.StartsWith("/images/"))
                {
                    b.CoverImageUrl = b.Slug.Contains("gunes-lekeleri")
                        ? "/uploads/treatments/lazerle-leke-tedavisi.jpg"
                        : "/uploads/corporate/doctor-portrait.jpg";
                    b.UpdatedAt = DateTime.UtcNow;
                    await _context.BlogPosts.ReplaceOneAsync(x => x.Id == b.Id, b, cancellationToken: cancellationToken);
                }
            }
            return;
        }

        var blogs = new List<BlogPost>
        {
            new()
            {
                Title = "Güneş Lekeleri ve Melazmadan Korunmak İçin Dermatolojik Öneriler",
                Slug = "gunes-lekeleri-ve-melazmadan-korunmak-icin-oneriler",
                Summary = "Cilt lekelerinin oluşum mekanizması, doğru güneş koruyucu seçimi ve sonbahar-kış döneminde uygulanan lazerle leke tedavisi hakkında bilmeniz gerekenler.",
                CoverImageUrl = "/uploads/treatments/lazerle-leke-tedavisi.jpg",
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
                CoverImageUrl = "/uploads/corporate/doctor-portrait.jpg",
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
