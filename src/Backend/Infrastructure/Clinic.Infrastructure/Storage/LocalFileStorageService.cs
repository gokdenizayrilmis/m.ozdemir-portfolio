using Clinic.Application.Common.Interfaces;
using Microsoft.AspNetCore.Hosting;

namespace Clinic.Infrastructure.Storage;

public class LocalFileStorageService : IImageStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalFileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder = "uploads",
        CancellationToken cancellationToken = default)
    {
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var sanitizedFolder = folder.Trim('/', '\\');
        var targetDirectory = Path.Combine(webRoot, sanitizedFolder);
        Directory.CreateDirectory(targetDirectory);

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = ".webp";
        }

        var safeFileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(targetDirectory, safeFileName);

        await using var outputStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
        await fileStream.CopyToAsync(outputStream, cancellationToken);

        return $"/{sanitizedFolder.Replace('\\', '/')}/{safeFileName}";
    }

    public Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return Task.FromResult(false);

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var relativePath = imageUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(webRoot, relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }
}

