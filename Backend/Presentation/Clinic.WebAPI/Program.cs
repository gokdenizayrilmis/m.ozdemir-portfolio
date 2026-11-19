using System.IO.Compression;
using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using Clinic.Application;
using Clinic.Application.Common.Models;
using Clinic.Domain.Constants;
using Clinic.Infrastructure;
using Clinic.Persistence;
using Clinic.Persistence.Context;
using Clinic.WebAPI.Middlewares;
using Microsoft.AspNetCore.HttpOverrides;
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

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

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

// 3. Configure Tiered Rate Limiting (Global + Public + Auth + Admin)
var jsonErrorOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = async (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            var retrySeconds = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds));
            context.HttpContext.Response.Headers.RetryAfter = retrySeconds.ToString();
        }

        context.HttpContext.Response.ContentType = "application/json";
        var response = Result.Failure("Çok fazla istek gönderdiniz. Lütfen birkaç saniye bekleyip tekrar deneyin.");
        var json = JsonSerializer.Serialize(response, jsonErrorOptions);
        await context.HttpContext.Response.WriteAsync(json, cancellationToken);
    };

    // Global safety umbrella: 200 req/min per IP across the entire API
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: GetClientIpKey(httpContext),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 200,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

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

    options.AddPolicy(RateLimitPolicies.AuthSensitive, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: GetAdminOrIpKey(httpContext),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.LeadsTrack, httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: GetClientIpKey(httpContext),
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.PublicRead, httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: GetClientIpKey(httpContext),
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 120,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.AdminRead, httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: GetAdminOrIpKey(httpContext),
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.AdminWrite, httpContext =>
        RateLimitPartition.GetSlidingWindowLimiter(
            partitionKey: GetAdminOrIpKey(httpContext),
            factory: _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = 25,
                Window = TimeSpan.FromMinutes(1),
                SegmentsPerWindow = 4,
                QueueLimit = 0
            }));

    options.AddPolicy(RateLimitPolicies.AdminHeavy, httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: GetAdminOrIpKey(httpContext),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
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
              .AllowCredentials()
              .WithExposedHeaders("Retry-After");
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
app.UseForwardedHeaders();
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseResponseCompression();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();
app.UseCors(NextJsCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();

app.Run();

static string GetClientIpKey(HttpContext context) =>
    context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

static string GetAdminOrIpKey(HttpContext context)
{
    var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
    return !string.IsNullOrWhiteSpace(userId)
        ? $"user:{userId}"
        : $"ip:{GetClientIpKey(context)}";
}
