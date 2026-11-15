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
        IFormFile file,
        [FromQuery] string folder = "uploads",
        CancellationToken cancellationToken = default)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(Result<string>.Failure("Yüklenecek görsel dosyası seçilmedi."));
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest(Result<string>.Failure("Yalnızca .webp, .jpg, .png, .avif ve .svg formatları desteklenmektedir."));
        }

        await using var stream = file.OpenReadStream();
        var imageUrl = await _imageStorageService.UploadImageAsync(
            stream,
            file.FileName,
            file.ContentType,
            folder,
            cancellationToken);

        return Ok(Result<string>.Success(imageUrl, "Görsel başarıyla yüklendi."));
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteImage([FromQuery] string imageUrl, CancellationToken cancellationToken = default)
    {
        var deleted = await _imageStorageService.DeleteImageAsync(imageUrl, cancellationToken);
        return deleted
            ? Ok(Result.Success("Görsel başarıyla silindi."))
            : NotFound(Result.Failure("Silinecek görsel bulunamadı."));
    }
}

