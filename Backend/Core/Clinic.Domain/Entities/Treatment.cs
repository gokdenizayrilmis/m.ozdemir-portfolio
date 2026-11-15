using Clinic.Domain.Common;
using Clinic.Domain.ValueObjects;

namespace Clinic.Domain.Entities;

public class Treatment : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string HtmlContent { get; set; } = string.Empty;
    public string CoverImageUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsPublished { get; set; } = true;
    public List<FaqItem> Faqs { get; set; } = new();
    public SeoMetadata Seo { get; set; } = new();
}

