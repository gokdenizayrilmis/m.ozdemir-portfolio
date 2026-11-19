using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public interface ILeadRepository
{
    Task<List<Lead>> GetFilteredAsync(
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        string? conversionType = null,
        CancellationToken cancellationToken = default);

    Task<(List<Lead> Items, int TotalCount)> GetPagedAsync(
        DateTime? fromUtc = null,
        string? conversionType = null,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        CancellationToken cancellationToken = default);

    Task CreateAsync(Lead lead, CancellationToken cancellationToken = default);
}
