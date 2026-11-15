using Clinic.Domain.Common;
using Clinic.Domain.ValueObjects;

namespace Clinic.Domain.Entities;

public class SiteSettings : BaseEntity
{
    public string ClinicName { get; set; } = "Prof. Dr. Mustafa Özdemir Dermatoloji Kliniği";
    public string DoctorName { get; set; } = "Prof. Dr. Mustafa Özdemir";
    public string DoctorTitle { get; set; } = "Dermatoloji (Deri ve Zührevi Hastalıkları) Uzmanı";
    public string DoctorBio { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public List<string> PhoneNumbers { get; set; } = new();
    public string WhatsAppNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string WorkingHours { get; set; } = string.Empty;
    public string GoogleMapsEmbedUrl { get; set; } = string.Empty;
    public SocialMediaLinks SocialMedia { get; set; } = new();
    public string? GoogleTagManagerId { get; set; }
    public string? GoogleAnalyticsId { get; set; }
    public string LegalNotice { get; set; } = "T.C. Sağlık Bakanlığı yönergeleri gereği sitemizde işlem fiyatları belirtilmemekte olup, tüm içerikler yalnızca bilgilendirme amaçlıdır. Tanı ve tedavi için mutlaka hekiminize başvurunuz.";
}

