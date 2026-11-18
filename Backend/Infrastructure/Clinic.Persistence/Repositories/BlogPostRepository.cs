using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class BlogPostRepository : BaseSlugMongoRepository<BlogPost>, IBlogPostRepository
{
    public BlogPostRepository(MongoDbContext context)
        : base(context.BlogPosts)
    {
    }

    public async Task<List<BlogPost>> GetAllAsync(string? tag = null, bool onlyPublished = true, CancellationToken cancellationToken = default)
    {
        var builder = Builders<BlogPost>.Filter;
        var filter = builder.Eq(x => x.IsDeleted, false);

        if (onlyPublished)
        {
            filter &= builder.Eq(x => x.IsPublished, true);
        }

        if (!string.IsNullOrWhiteSpace(tag))
        {
            filter &= builder.AnyEq(x => x.Tags, tag.Trim());
        }

        return await Collection
            .Find(filter)
            .SortByDescending(x => x.PublishedAt)
            .ToListAsync(cancellationToken);
    }
}
