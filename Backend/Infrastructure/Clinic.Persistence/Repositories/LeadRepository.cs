using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class LeadRepository : ILeadRepository
{
    private static readonly string[] ValidClickTypes = { "WhatsAppClick", "PhoneClick" };

    private readonly MongoDbContext _context;

    public LeadRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lead>> GetFilteredAsync(
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        string? conversionType = null,
        CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(fromUtc, toUtc, conversionType);
        return await _context.Leads
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<(List<Lead> Items, int TotalCount)> GetPagedAsync(
        DateTime? fromUtc = null,
        string? conversionType = null,
        int page = 1,
        int pageSize = 25,
        CancellationToken cancellationToken = default)
    {
        var safePage = page < 1 ? 1 : page;
        var safePageSize = pageSize < 1 ? 25 : (pageSize > 200 ? 200 : pageSize);
        var filter = BuildFilter(fromUtc, null, conversionType);

        var totalCount = (int)await _context.Leads.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _context.Leads
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Limit(safePageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task CreateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        await _context.Leads.InsertOneAsync(lead, cancellationToken: cancellationToken);
    }

    private static FilterDefinition<Lead> BuildFilter(
        DateTime? fromUtc,
        DateTime? toUtc,
        string? conversionType)
    {
        var builder = Builders<Lead>.Filter;
        var filter = builder.Eq(x => x.IsDeleted, false);

        if (fromUtc.HasValue)
        {
            filter &= builder.Gte(x => x.CreatedAt, fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            filter &= builder.Lt(x => x.CreatedAt, toUtc.Value);
        }

        if (!string.IsNullOrWhiteSpace(conversionType) &&
            !string.Equals(conversionType, "all", StringComparison.OrdinalIgnoreCase))
        {
            filter &= builder.Eq(x => x.ConversionType, conversionType.Trim());
        }
        else
        {
            // Exclude any legacy ContactForm records so totalClicks == whatsAppClicks + phoneClicks
            filter &= builder.In(x => x.ConversionType, ValidClickTypes);
        }

        return filter;
    }
}
