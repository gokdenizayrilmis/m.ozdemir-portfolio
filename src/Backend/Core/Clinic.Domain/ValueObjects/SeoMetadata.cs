namespace Clinic.Domain.ValueObjects;

public class SeoMetadata
{
    public string MetaTitle { get; set; } = string.Empty;
    public string MetaDescription { get; set; } = string.Empty;
    public string? CanonicalUrl { get; set; }
    public string? OgImageUrl { get; set; }
    public List<string> FocusKeywords { get; set; } = new();
    public bool NoIndex { get; set; } = false;
    public string SchemaType { get; set; } = "MedicalWebPage";
}

