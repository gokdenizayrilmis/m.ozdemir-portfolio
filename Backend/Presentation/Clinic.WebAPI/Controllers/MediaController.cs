using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MediaController : ControllerBase
{
    private readonly IImageStorageService _imageStorageService;

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"
    };

    public MediaController(IImageStorageService imageStorageService)
    {
        _imageStorageService = imageStorageService;
    }

    [HttpPost("upload")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> UploadImage(
        [FromForm] IFormFile file,
        [FromQuery] string folder = "general",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(Result<string>.Failure("Yüklenecek görsel dosyası seçilmedi."));
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(Result<string>.Failure("Yalnızca .webp, .jpg, .jpeg, .png, .avif ve .svg formatları desteklenmektedir."));
        }

        await using var stream = file.OpenReadStream();
        var relativePath = await _imageStorageService.UploadImageAsync(
            stream,
            file.FileName,
            file.ContentType,
            folder,
            cancellationToken);

        var fullUrl = $"{Request.Scheme}://{Request.Host}{relativePath}";
        return Ok(Result<string>.Success(fullUrl, "Görsel başarıyla yüklendi."));
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteImage(
        [FromQuery] string? fileUrl = null,
        [FromQuery] string? imageUrl = null,
        CancellationToken cancellationToken = default)
    {
        var targetUrl = !string.IsNullOrWhiteSpace(fileUrl) ? fileUrl : imageUrl;
        if (string.IsNullOrWhiteSpace(targetUrl))
        {
            return BadRequest(Result.Failure("Silinecek görsel URL'si belirtilmedi."));
        }

        var deleted = await _imageStorageService.DeleteImageAsync(targetUrl, cancellationToken);
        return deleted
            ? Ok(Result.Success("Görsel başarıyla silindi."))
            : NotFound(Result.Failure("Silinecek görsel bulunamadı."));
    }
}
