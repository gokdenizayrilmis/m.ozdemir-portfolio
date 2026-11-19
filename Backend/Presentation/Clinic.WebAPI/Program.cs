using System.IO.Compression;
using System.Text.Json;
using System.Threading.RateLimiting;
using Clinic.Application;
using Clinic.Application.Common.Models;
using Clinic.Domain.Constants;
using Clinic.Infrastructure;
using Clinic.Persistence;
using Clinic.Persistence.Context;
using Clinic.WebAPI.Middlewares;
using Microsoft.AspNetCore.ResponseCompression;

const string NextJsCorsPolicy = "NextJsCorsPolicy";

var builder = WebApplication.CreateBuilder(args);

// 1. Add Onion Architecture Layer Services
builder.Services.AddApplicationServices();
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Add Controllers, OpenAPI & Response Compression (Brotli + Gzip)
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.Providers.Add<BrotliCompressionProvider>();
    options.Providers.Add<GzipCompressionProvider>();
});

builder.Services.Configure<BrotliCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
});

// 3. Configure IP-based Rate Limiting for Public Endpoints
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.ContentType = "application/json";
        var response = Result.Failure("Çok fazla istek gönderdiniz. Lütfen kısa bir süre sonra tekrar deneyiniz.");
        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        await context.HttpContext.Response.WriteAsync(json, cancellationToken);
    };

    options.AddPolicy(RateLimitPolicies.AuthLogin, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: GetClientIpKey(httpContext),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.AuthRefresh, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: GetClientIpKey(httpContext),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.LeadsTrack, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: GetClientIpKey(httpContext),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// 4. Configure CORS for Next.js Frontend (Specific origins required for AllowCredentials)
var configuredOrigins = builder.Configuration
    .GetSection("CorsSettings:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

var allowedOrigins = configuredOrigins
    .Where(o => !string.IsNullOrWhiteSpace(o) && o != "*")
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

if (allowedOrigins.Length == 0)
{
    allowedOrigins = new[]
    {
        "http://localhost:3000",
        "https://drmustafaozdemir.com",
        "https://www.drmustafaozdemir.com"
    };
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(NextJsCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Ensure wwwroot/uploads directory exists on startup
var webRootPath = app.Environment.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
var uploadsPath = Path.Combine(webRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);

// 5. Ensure MongoDB Indexes at Startup (no automatic data seeding)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        await dbContext.EnsureIndexesAsync(app.Lifetime.ApplicationStopping);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "MongoDB indeks kontrolü sırasında bağlantı kurulamadı.");
    }
}

// 6. Configure HTTP Request Pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();
app.UseCors(NextJsCorsPolicy);
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

static string GetClientIpKey(HttpContext context) =>
    context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
