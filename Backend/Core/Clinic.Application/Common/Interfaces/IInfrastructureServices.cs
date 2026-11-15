namespace Clinic.Application.Common.Interfaces;

public interface IImageStorageService
{
    Task<string> UploadImageAsync(Stream fileStream, string fileName, string contentType, string folder = "uploads", CancellationToken cancellationToken = default);
    Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(string userId, string email, string fullName, string role);
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

