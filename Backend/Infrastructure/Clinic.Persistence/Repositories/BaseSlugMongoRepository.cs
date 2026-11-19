using Clinic.Application.Common.Extensions;
using Clinic.Domain.Common;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

/// <summary>
/// Ortak CRUD, slug sorgulama ve soft-delete işlemlerini yöneten temel MongoDB repository sınıfı.
/// </summary>
public abstract class BaseSlugMongoRepository<T> where T : BaseEntity, ISlugEntity
{
    protected readonly IMongoCollection<T> Collection;

    protected BaseSlugMongoRepository(IMongoCollection<T> collection)
    {
        Collection = collection;
    }

    protected static string NormalizeSlug(string slug) => slug.ToNormalizedSlug();

    public async Task<T?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await Collection
            .Find(x => x.Id == id && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<T?> GetBySlugAsync(string slug, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeSlug(slug);
        return await Collection
            .Find(x => x.Slug == normalized && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> ExistsBySlugAsync(string slug, string? excludeId = null, CancellationToken cancellationToken = default)
    {
        var normalized = NormalizeSlug(slug);
        var filter = Builders<T>.Filter.Eq(x => x.Slug, normalized)
                   & Builders<T>.Filter.Eq(x => x.IsDeleted, false);

        if (!string.IsNullOrWhiteSpace(excludeId))
        {
            filter &= Builders<T>.Filter.Ne(x => x.Id, excludeId);
        }

        return await Collection.Find(filter).AnyAsync(cancellationToken);
    }

    public async Task CreateAsync(T entity, CancellationToken cancellationToken = default)
    {
        await Collection.InsertOneAsync(entity, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        await Collection.ReplaceOneAsync(
            x => x.Id == entity.Id && !x.IsDeleted,
            entity,
            cancellationToken: cancellationToken);
    }

    /// <summary>
    /// Kaydı kalıcı silmek yerine IsDeleted=true işaretler; unique slug indeksini serbest bırakmak için slug'a silme soneki ekler.
    /// </summary>
    public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var existing = await GetByIdAsync(id, cancellationToken);
        if (existing is null)
            return;

        var archivedSlug = existing.Slug.Contains("--deleted-")
            ? existing.Slug
            : $"{existing.Slug}--deleted-{existing.Id}";

        var update = Builders<T>.Update
            .Set(x => x.IsDeleted, true)
            .Set(x => x.UpdatedAt, DateTime.UtcNow)
            .Set(x => x.Slug, archivedSlug);

        await Collection.UpdateOneAsync(
            x => x.Id == id && !x.IsDeleted,
            update,
            cancellationToken: cancellationToken);
    }
}
