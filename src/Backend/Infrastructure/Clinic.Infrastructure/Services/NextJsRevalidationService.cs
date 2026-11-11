using System.Net.Http.Json;
using Clinic.Application.Common.Interfaces;
using Clinic.Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Clinic.Infrastructure.Services;

public class NextJsRevalidationService : INextJsRevalidationService
{
    private readonly HttpClient _httpClient;
    private readonly NextJsSettings _settings;
    private readonly ILogger<NextJsRevalidationService> _logger;

    public NextJsRevalidationService(
        HttpClient httpClient,
        IOptions<NextJsSettings> settings,
        ILogger<NextJsRevalidationService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task RevalidatePathsAsync(IEnumerable<string> paths, CancellationToken cancellationToken = default)
    {
        var pathList = paths.Where(p => !string.IsNullOrWhiteSpace(p)).Distinct().ToList();
        if (pathList.Count == 0 || string.IsNullOrWhiteSpace(_settings.BaseUrl))
            return;

        try
        {
            var endpoint = $"{_settings.BaseUrl.TrimEnd('/')}/api/revalidate";
            var payload = new
            {
                secret = _settings.RevalidationSecret,
                paths = pathList
            };

            var response = await _httpClient.PostAsJsonAsync(endpoint, payload, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Next.js ISR önbellek temizleme isteği başarısız oldu: {StatusCode}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            // Frontend henüz çalışmıyorken (örn. local geliştirmede) işlemi bloklamamak için loglayıp devam ediyoruz.
            _logger.LogDebug(ex, "Next.js ISR webhook tetiklenemedi (Frontend çevrimdışı olabilir).");
        }
    }
}

