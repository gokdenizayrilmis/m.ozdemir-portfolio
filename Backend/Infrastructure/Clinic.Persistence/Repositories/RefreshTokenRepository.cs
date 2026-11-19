using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly MongoDbContext _context;

    public RefreshTokenRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens
            .Find(x => x.TokenHash == tokenHash && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task CreateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await _context.RefreshTokens.InsertOneAsync(refreshToken, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await _context.RefreshTokens.ReplaceOneAsync(
            x => x.Id == refreshToken.Id,
            refreshToken,
            cancellationToken: cancellationToken);
    }

    public async Task RevokeAllActiveByUserIdAsync(string adminUserId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var filter = Builders<RefreshToken>.Filter.And(
            Builders<RefreshToken>.Filter.Eq(x => x.AdminUserId, adminUserId),
            Builders<RefreshToken>.Filter.Eq(x => x.RevokedAt, null),
            Builders<RefreshToken>.Filter.Eq(x => x.IsDeleted, false));

        var update = Builders<RefreshToken>.Update
            .Set(x => x.RevokedAt, now)
            .Set(x => x.UpdatedAt, now);

        await _context.RefreshTokens.UpdateManyAsync(filter, update, cancellationToken: cancellationToken);
    }
}
