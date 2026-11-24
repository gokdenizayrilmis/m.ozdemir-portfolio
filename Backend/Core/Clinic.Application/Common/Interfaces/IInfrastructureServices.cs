namespace Clinic.Application.Common.Interfaces;

public interface IImageStorageService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType, string folder = "uploads", CancellationToken cancellationToken = default);
    Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
}

public static class ImageStorageExtensions
{
    public static Task<bool> DeleteNonCorporateImageIfAnyAsync(
        this IImageStorageService imageStorageService,
        string? imageUrl,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl) ||
            imageUrl.Contains("/uploads/corporate/", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(false);
        }

        return imageStorageService.DeleteImageAsync(imageUrl, cancellationToken);
    }
}

public interface IJwtTokenGenerator
{
    int RefreshTokenExpiryHours { get; }
    string GenerateToken(string userId, string email, string fullName, string role);
    string GenerateRefreshToken();
    string HashToken(string rawToken);
}

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface INextJsRevalidationService
{
    Task RevalidatePathsAsync(IEnumerable<string> paths, CancellationToken cancellationToken = default);
}
