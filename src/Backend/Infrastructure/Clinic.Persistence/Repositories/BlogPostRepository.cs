using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class BlogPostRepository : IBlogPostRepository
{
    private readonly MongoDbContext _context;

    public BlogPostRepository(MongoDbContext context)
    {
        _context = context;
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

        return await _context.BlogPosts
            .Find(filter)
            .SortByDescending(x => x.PublishedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<BlogPost?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _context.BlogPosts
            .Find(x => x.Id == id && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<BlogPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        return await _context.BlogPosts
            .Find(x => x.Slug == normalized && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, string? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalized = slug.Trim().ToLowerInvariant();
        var filter = Builders<BlogPost>.Filter.Eq(x => x.Slug, normalized);

        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            filter &= Builders<BlogPost>.Filter.Ne(x => x.Id, excludeId);
        }

        return await _context.BlogPosts.Find(filter).AnyAsync(cancellationToken);
    }

    public async Task CreateAsync(BlogPost blogPost, CancellationToken cancellationToken = default)
    {
        await _context.BlogPosts.InsertOneAsync(blogPost, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(BlogPost blogPost, CancellationToken cancellationToken = default)
    {
        await _context.BlogPosts.ReplaceOneAsync(
            x => x.Id == blogPost.Id,
            blogPost,
            cancellationToken: cancellationToken);
    }

    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        await _context.BlogPosts.DeleteOneAsync(x => x.Id == id, cancellationToken);
    }
}

