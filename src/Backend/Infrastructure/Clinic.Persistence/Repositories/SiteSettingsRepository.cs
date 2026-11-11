using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class SiteSettingsRepository : ISiteSettingsRepository
{
    private readonly MongoDbContext _context;

    public SiteSettingsRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<SiteSettings> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _context.SiteSettings
            .Find(_ => true)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings is null)
        {
            settings = new SiteSettings();
            await _context.SiteSettings.InsertOneAsync(settings, cancellationToken: cancellationToken);
        }

        return settings;
    }

    public async Task UpdateSettingsAsync(SiteSettings settings, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(settings.Id))
        {
            await _context.SiteSettings.InsertOneAsync(settings, cancellationToken: cancellationToken);
            return;
        }

        await _context.SiteSettings.ReplaceOneAsync(
            x => x.Id == settings.Id,
            settings,
            new ReplaceOptions { IsUpsert = true },
            cancellationToken);
    }
}

