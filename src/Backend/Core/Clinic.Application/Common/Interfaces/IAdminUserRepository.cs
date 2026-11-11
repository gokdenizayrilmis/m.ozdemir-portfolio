using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public interface IAdminUserRepository
{
    Task<AdminUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task CreateAsync(AdminUser adminUser, CancellationToken cancellationToken = default);
}

