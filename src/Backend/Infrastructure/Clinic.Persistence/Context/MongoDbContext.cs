using Clinic.Domain.Common;
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

    public IMongoCollection<Category> Categories => _database.GetCollection<Category>("categories");
    public IMongoCollection<Treatment> Treatments => _database.GetCollection<Treatment>("treatments");
    public IMongoCollection<BlogPost> BlogPosts => _database.GetCollection<BlogPost>("blog_posts");
    public IMongoCollection<SiteSettings> SiteSettings => _database.GetCollection<SiteSettings>("site_settings");
    public IMongoCollection<Lead> Leads => _database.GetCollection<Lead>("leads");
    public IMongoCollection<AdminUser> AdminUsers => _database.GetCollection<AdminUser>("admin_users");

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

            if (!BsonClassMap.IsClassMapRegistered(typeof(Category)))
                BsonClassMap.RegisterClassMap<Category>(cm => cm.AutoMap());

            if (!BsonClassMap.IsClassMapRegistered(typeof(Treatment)))
                BsonClassMap.RegisterClassMap<Treatment>(cm => cm.AutoMap());

            if (!BsonClassMap.IsClassMapRegistered(typeof(BlogPost)))
                BsonClassMap.RegisterClassMap<BlogPost>(cm => cm.AutoMap());

            if (!BsonClassMap.IsClassMapRegistered(typeof(SiteSettings)))
                BsonClassMap.RegisterClassMap<SiteSettings>(cm => cm.AutoMap());

            if (!BsonClassMap.IsClassMapRegistered(typeof(Lead)))
                BsonClassMap.RegisterClassMap<Lead>(cm => cm.AutoMap());

            if (!BsonClassMap.IsClassMapRegistered(typeof(AdminUser)))
                BsonClassMap.RegisterClassMap<AdminUser>(cm => cm.AutoMap());

            _mappingsRegistered = true;
        }
    }

    public async Task EnsureIndexesAsync(CancellationToken cancellationToken = default)
    {
        var categorySlugIndex = new CreateIndexModel<Category>(
            Builders<Category>.IndexKeys.Ascending(x => x.Slug),
            new CreateIndexOptions { Unique = true, Name = "idx_categories_slug_unique" });
        await Categories.Indexes.CreateOneAsync(categorySlugIndex, cancellationToken: cancellationToken);

        var treatmentSlugIndex = new CreateIndexModel<Treatment>(
            Builders<Treatment>.IndexKeys.Ascending(x => x.Slug),
            new CreateIndexOptions { Unique = true, Name = "idx_treatments_slug_unique" });
        await Treatments.Indexes.CreateOneAsync(treatmentSlugIndex, cancellationToken: cancellationToken);

        var treatmentCategoryIndex = new CreateIndexModel<Treatment>(
            Builders<Treatment>.IndexKeys.Ascending(x => x.CategorySlug).Ascending(x => x.DisplayOrder),
            new CreateIndexOptions { Name = "idx_treatments_category_order" });
        await Treatments.Indexes.CreateOneAsync(treatmentCategoryIndex, cancellationToken: cancellationToken);

        var blogSlugIndex = new CreateIndexModel<BlogPost>(
            Builders<BlogPost>.IndexKeys.Ascending(x => x.Slug),
            new CreateIndexOptions { Unique = true, Name = "idx_blogs_slug_unique" });
        await BlogPosts.Indexes.CreateOneAsync(blogSlugIndex, cancellationToken: cancellationToken);

        var adminEmailIndex = new CreateIndexModel<AdminUser>(
            Builders<AdminUser>.IndexKeys.Ascending(x => x.Email),
            new CreateIndexOptions { Unique = true, Name = "idx_admin_users_email_unique" });
        await AdminUsers.Indexes.CreateOneAsync(adminEmailIndex, cancellationToken: cancellationToken);
    }
}

