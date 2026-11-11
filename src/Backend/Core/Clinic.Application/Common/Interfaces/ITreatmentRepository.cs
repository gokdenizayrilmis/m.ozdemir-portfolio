using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public interface ITreatmentRepository
{
    Task<List<Treatment>> GetAllAsync(string? categorySlug = null, bool onlyPublished = true, CancellationToken cancellationToken = default);
    Task<Treatment?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Treatment?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default);
    Task<bool> ExistsBySlugAsync(string slug, string? excludeId = null, CancellationToken cancellationToken = default);
    Task CreateAsync(Treatment treatment, CancellationToken cancellationToken = default);
    Task UpdateAsync(Treatment treatment, CancellationToken cancellationToken = default);
    Task DeleteAsync(string id, CancellationToken cancellationToken = default);
}

