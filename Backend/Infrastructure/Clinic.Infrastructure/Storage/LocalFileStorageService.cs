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
        string folder = "general",
        CancellationToken cancellationToken = default)
    {
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var cleanSubFolder = string.IsNullOrWhiteSpace(folder)
            ? "general"
            : folder.Trim('/', '\\');

        // Ensure files are stored inside wwwroot/uploads/{folder}/
        if (cleanSubFolder.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase) ||
            cleanSubFolder.StartsWith("uploads\\", StringComparison.OrdinalIgnoreCase))
        {
            cleanSubFolder = cleanSubFolder.Substring("uploads".Length).Trim('/', '\\');
        }
        if (string.Equals(cleanSubFolder, "uploads", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(cleanSubFolder))
        {
            cleanSubFolder = "general";
        }

        var targetDirectory = Path.Combine(webRoot, "uploads", cleanSubFolder);
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

        return $"/uploads/{cleanSubFolder.Replace('\\', '/')}/{safeFileName}";
    }

    public Task<bool> DeleteImageAsync(string imageUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return Task.FromResult(false);

        var pathPart = imageUrl.Trim();
        if (Uri.TryCreate(pathPart, UriKind.Absolute, out var absoluteUri))
        {
            pathPart = absoluteUri.AbsolutePath;
        }

        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var relativePath = pathPart.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.Combine(webRoot, relativePath);

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }
}
