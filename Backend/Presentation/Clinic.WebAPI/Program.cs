using Clinic.Application;
using Clinic.Infrastructure;
using Clinic.Persistence;
using Clinic.Persistence.Context;
using Clinic.WebAPI.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Onion Architecture Layer Services
builder.Services.AddApplicationServices();
builder.Services.AddPersistenceServices(builder.Configuration);
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Add Controllers & OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// 3. Configure CORS for Next.js Frontend
var allowedOrigins = builder.Configuration
    .GetSection("CorsSettings:AllowedOrigins")
    .Get<string[]>() ?? new[] { "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("NextJsCorsPolicy", policy =>
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

// 4. Ensure MongoDB Indexes at Startup (no automatic data seeding)
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        await dbContext.EnsureIndexesAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "MongoDB indeks kontrolü sırasında bağlantı kurulamadı.");
    }
}

// 5. Configure HTTP Request Pipeline
app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();
app.UseCors("NextJsCorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
