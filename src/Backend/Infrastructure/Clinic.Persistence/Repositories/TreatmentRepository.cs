using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class TreatmentRepository : ITreatmentRepository
{
    private readonly MongoDbContext _context;

    public TreatmentRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Treatment>> GetAllAsync(string? categorySlug = null, bool onlyPublished = true, CancellationToken cancellationToken = default)
    {
        var builder = Builders<Treatment>.Filter;
        var filter = builder.Eq(x => x.IsDeleted, false);

        if (onlyPublished)
        {
            filter &= builder.Eq(x => x.IsPublished, true);
        }

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            filter &= builder.Eq(x => x.CategorySlug, categorySlug.Trim().ToLowerInvariant());
        }

        return await _context.Treatments
            .Find(filter)
            .SortBy(x => x.DisplayOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);
    }

    public async Task<Treatment?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _context.Treatments
            .Find(x => x.Id == id && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Treatment?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        return await _context.Treatments
            .Find(x => x.Slug == normalized && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, string? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var filter = Builders<Treatment>.Filter.Eq(x => x.Slug, normalized);

        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            filter &= Builders<Treatment>.Filter.Ne(x => x.Id, excludeId);
        }

        return await _context.Treatments.Find(filter).AnyAsync(cancellationToken);
    }

    public async Task CreateAsync(Treatment treatment, CancellationToken cancellationToken = default)
    {
        await _context.Treatments.InsertOneAsync(treatment, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(Treatment treatment, CancellationToken cancellationToken = default)
    {
        await _context.Treatments.ReplaceOneAsync(
            x => x.Id == treatment.Id,
            treatment,
            cancellationToken: cancellationToken);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _context.Treatments.DeleteOneAsync(x => x.Id == id, cancellationToken);
    }
}

