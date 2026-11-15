using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public interface ISiteSettingsRepository
{
    Task<SiteSettings> GetSettingsAsync(CancellationToken cancellationToken = default);
    Task UpdateSettingsAsync(SiteSettings settings, CancellationToken cancellationToken = default);
}

