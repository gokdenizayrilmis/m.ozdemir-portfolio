using Clinic.Domain.Common;
using Clinic.Domain.ValueObjects;

namespace Clinic.Domain.Entities;

public class BlogPost : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string HtmlContent { get; set; } = string.Empty;
    public string CoverImageUrl { get; set; } = string.Empty;
    public string Author { get; set; } = "Prof. Dr. Mustafa Özdemir";
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public bool IsPublished { get; set; } = true;
    public List<string> Tags { get; set; } = new();
    public SeoMetadata Seo { get; set; } = new() { SchemaType = "MedicalScholarlyArticle" };
}

