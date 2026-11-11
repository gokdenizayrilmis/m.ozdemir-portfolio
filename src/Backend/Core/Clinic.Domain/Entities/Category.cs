using Clinic.Domain.Common;
using Clinic.Domain.ValueObjects;

namespace Clinic.Domain.Entities;

public class Category : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public SeoMetadata Seo { get; set; } = new();
}

