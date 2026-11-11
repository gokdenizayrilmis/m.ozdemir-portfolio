using Clinic.Application.Common.Interfaces;
using Clinic.Persistence.Context;
using Clinic.Persistence.Repositories;
using Clinic.Persistence.Seed;
using Clinic.Persistence.Settings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Clinic.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistenceServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MongoDbSettings>(
            configuration.GetSection(MongoDbSettings.SectionName));

        services.AddSingleton<MongoDbContext>();

        services.AddScoped<ITreatmentRepository, TreatmentRepository>();
        services.AddScoped<IBlogPostRepository, BlogPostRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ISiteSettingsRepository, SiteSettingsRepository>();
        services.AddScoped<ILeadRepository, LeadRepository>();
        services.AddScoped<IAdminUserRepository, AdminUserRepository>();

        services.AddScoped<DatabaseSeeder>();

        return services;
    }
}

