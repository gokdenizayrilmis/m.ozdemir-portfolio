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

    private string GetUploadsRoot()
    {
        var webRoot = _env.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        return Path.GetFullPath(Path.Combine(webRoot, "uploads"));
    }

    private static bool IsPathInsideRoot(string fullPath, string rootPath)
    {
        var normalizedRoot = rootPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                           + Path.DirectorySeparatorChar;
        return fullPath.StartsWith(normalizedRoot, StringComparison.OrdinalIgnoreCase);
    }

    public async Task<string> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string folder = "general",
        CancellationToken cancellationToken = default)
    {
        var uploadsRoot = GetUploadsRoot();

        var cleanSubFolder = string.IsNullOrWhiteSpace(folder)
            ? "general"
            : folder.Trim('/', '\\');

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

        var targetDirectory = Path.GetFullPath(Path.Combine(uploadsRoot, cleanSubFolder));
        if (!IsPathInsideRoot(targetDirectory, uploadsRoot))
        {
            throw new UnauthorizedAccessException("Geçersiz yükleme klasörü yolu.");
        }

        Directory.CreateDirectory(targetDirectory);

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = ".webp";
        }

        var safeFileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.GetFullPath(Path.Combine(targetDirectory, safeFileName));
        if (!IsPathInsideRoot(fullPath, uploadsRoot))
        {
            throw new UnauthorizedAccessException("Geçersiz dosya yolu.");
        }

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

        var uploadsRoot = GetUploadsRoot();
        var webRoot = Path.GetDirectoryName(uploadsRoot) ?? uploadsRoot;
        var relativePath = pathPart.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(webRoot, relativePath));

        // Path traversal koruması: yalnızca wwwroot/uploads altındaki dosyalar silinebilir.
        if (!IsPathInsideRoot(fullPath, uploadsRoot))
        {
            return Task.FromResult(false);
        }

        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            return Task.FromResult(true);
        }

        return Task.FromResult(false);
    }
}
