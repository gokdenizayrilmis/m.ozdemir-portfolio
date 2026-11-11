using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class AdminUserRepository : IAdminUserRepository
{
    private readonly MongoDbContext _context;

    public AdminUserRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<AdminUser?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        return await _context.AdminUsers
            .Find(x => x.Email == normalized && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task CreateAsync(AdminUser adminUser, CancellationToken cancellationToken = default)
    {
        await _context.AdminUsers.InsertOneAsync(adminUser, cancellationToken: cancellationToken);
    }
}

