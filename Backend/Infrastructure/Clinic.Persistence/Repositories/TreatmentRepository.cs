using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class TreatmentRepository : BaseSlugMongoRepository<Treatment>, ITreatmentRepository
{
    public TreatmentRepository(MongoDbContext context)
        : base(context.Treatments)
    {
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
            filter &= builder.Eq(x => x.CategorySlug, NormalizeSlug(categorySlug));
        }

        return await Collection
            .Find(filter)
            .SortBy(x => x.DisplayOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);
    }
}
