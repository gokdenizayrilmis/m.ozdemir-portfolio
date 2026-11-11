using Clinic.Domain.Common;

namespace Clinic.Domain.Entities;

public class Lead : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string SourcePageSlug { get; set; } = string.Empty;
    public string ConversionType { get; set; } = "ContactForm"; // ContactForm, WhatsAppClick, PhoneClick
    public string? UtmSource { get; set; }
    public string? UtmMedium { get; set; }
    public string? UtmCampaign { get; set; }
    public bool IsRead { get; set; } = false;
}

