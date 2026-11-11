using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public interface ILeadRepository
{
    Task<List<Lead>> GetAllAsync(bool? isRead = null, CancellationToken cancellationToken = default);
    Task<Lead?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task CreateAsync(Lead lead, CancellationToken cancellationToken = default);
    Task UpdateAsync(Lead lead, CancellationToken cancellationToken = default);
}

