using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public interface IBlogPostRepository
{
    Task<List<BlogPost>> GetAllAsync(string? tag = null, bool onlyPublished = true, CancellationToken cancellationToken = default);
    Task<BlogPost?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<BlogPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, string? excludeId = null, CancellationToken cancellationToken = default);
    Task CreateAsync(BlogPost blogPost, CancellationToken cancellationToken = default);
    Task UpdateAsync(BlogPost blogPost, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}

