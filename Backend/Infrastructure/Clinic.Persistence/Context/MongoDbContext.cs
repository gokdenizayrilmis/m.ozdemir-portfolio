using Clinic.Domain.Common;
using Clinic.Domain.Constants;
using Clinic.Domain.Entities;
using Clinic.Persistence.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace Clinic.Persistence.Context;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private static readonly object LockObj = new();
    private static bool _mappingsRegistered = false;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        RegisterClassMaps();

        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<Category> Categories => _database.GetCollection<Category>(MongoCollectionNames.Categories);
    public IMongoCollection<Treatment> Treatments => _database.GetCollection<Treatment>(MongoCollectionNames.Treatments);
    public IMongoCollection<BlogPost> BlogPosts => _database.GetCollection<BlogPost>(MongoCollectionNames.BlogPosts);
    public IMongoCollection<SiteSettings> SiteSettings => _database.GetCollection<SiteSettings>(MongoCollectionNames.SiteSettings);
    public IMongoCollection<Lead> Leads => _database.GetCollection<Lead>(MongoCollectionNames.Leads);
    public IMongoCollection<AdminUser> AdminUsers => _database.GetCollection<AdminUser>(MongoCollectionNames.AdminUsers);
    public IMongoCollection<RefreshToken> RefreshTokens => _database.GetCollection<RefreshToken>(MongoCollectionNames.RefreshTokens);

    private static void RegisterClassMaps()
    {
        if (_mappingsRegistered) return;

        lock (LockObj)
        {
            if (_mappingsRegistered) return;

            if (!BsonClassMap.IsClassMapRegistered(typeof(BaseEntity)))
            {
                BsonClassMap.RegisterClassMap<BaseEntity>(cm =>
                {
                    cm.AutoMap();
                    cm.SetIsRootClass(true);
                    cm.MapIdMember(c => c.Id)
                      .SetIdGenerator(StringObjectIdGenerator.Instance)
                      .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });
            }

            RegisterEntityMap<Category>();
            RegisterEntityMap<Treatment>();
            RegisterEntityMap<BlogPost>();
            RegisterEntityMap<SiteSettings>();
            RegisterEntityMap<Lead>();
            RegisterEntityMap<AdminUser>();
            RegisterEntityMap<RefreshToken>();

            _mappingsRegistered = true;
        }
    }

    private static void RegisterEntityMap<T>()
    {
        if (!BsonClassMap.IsClassMapRegistered(typeof(T)))
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
            {
                cm.AutoMap();
                cm.SetIgnoreExtraElements(true);
            });
        }
    }

    public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
    {
        // Categories
        var categorySlugIndex = new CreateIndexModel<Category>(
            Builders<Category>.IndexKeys.Ascending(x => x.Slug),
            new CreateIndexOptions { Unique = true, Name = "idx_categories_slug_unique" });
        await Categories.Indexes.CreateOneAsync(categorySlugIndex, cancellationToken: cancellationToken);

        // Treatments
        await Treatments.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<Treatment>(
                Builders<Treatment>.IndexKeys.Ascending(x => x.Slug),
                new CreateIndexOptions { Unique = true, Name = "idx_treatments_slug_unique" }),
            new CreateIndexModel<Treatment>(
                Builders<Treatment>.IndexKeys
                    .Ascending(x => x.CategorySlug)
                    .Ascending(x => x.IsPublished)
                    .Ascending(x => x.DisplayOrder),
                new CreateIndexOptions { Name = "idx_treatments_category_published_order" })
        }, cancellationToken: cancellationToken);

        // BlogPosts
        await BlogPosts.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<BlogPost>(
                Builders<BlogPost>.IndexKeys.Ascending(x => x.Slug),
                new CreateIndexOptions { Unique = true, Name = "idx_blogs_slug_unique" }),
            new CreateIndexModel<BlogPost>(
                Builders<BlogPost>.IndexKeys
                    .Ascending(x => x.IsPublished)
                    .Descending(x => x.PublishedAt),
                new CreateIndexOptions { Name = "idx_blogs_published_publishedAt" })
        }, cancellationToken: cancellationToken);

        // Leads (summary & paged queries)
        var leadsCreatedTypeIndex = new CreateIndexModel<Lead>(
            Builders<Lead>.IndexKeys
                .Descending(x => x.CreatedAt)
                .Ascending(x => x.ConversionType),
            new CreateIndexOptions { Name = "idx_leads_createdAt_desc_type" });
        await Leads.Indexes.CreateOneAsync(leadsCreatedTypeIndex, cancellationToken: cancellationToken);

        // AdminUsers
        var adminEmailIndex = new CreateIndexModel<AdminUser>(
            Builders<AdminUser>.IndexKeys.Ascending(x => x.Email),
            new CreateIndexOptions { Unique = true, Name = "idx_admin_users_email_unique" });
        await AdminUsers.Indexes.CreateOneAsync(adminEmailIndex, cancellationToken: cancellationToken);

        // RefreshTokens (unique hash, user lookup, and TTL auto-purge on ExpiresAt)
        await RefreshTokens.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<RefreshToken>(
                Builders<RefreshToken>.IndexKeys.Ascending(x => x.TokenHash),
                new CreateIndexOptions { Unique = true, Name = "idx_refresh_tokens_hash_unique" }),
            new CreateIndexModel<RefreshToken>(
                Builders<RefreshToken>.IndexKeys.Ascending(x => x.AdminUserId),
                new CreateIndexOptions { Name = "idx_refresh_tokens_user" }),
            new CreateIndexModel<RefreshToken>(
                Builders<RefreshToken>.IndexKeys.Ascending(x => x.ExpiresAt),
                new CreateIndexOptions { ExpireAfter = TimeSpan.Zero, Name = "idx_refresh_tokens_expires_ttl" })
        }, cancellationToken: cancellationToken);
    }
}
