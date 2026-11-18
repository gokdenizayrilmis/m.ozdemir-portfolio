using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class CategoryRepository : BaseSlugMongoRepository<Category>, ICategoryRepository
{
    public CategoryRepository(MongoDbContext context)
        : base(context.Categories)
    {
    }

    public async Task<List<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await Collection
            .Find(x => !x.IsDeleted)
            .SortBy(x => x.DisplayOrder)
            .ThenBy(x => x.Title)
            .ToListAsync(cancellationToken);
    }
}
