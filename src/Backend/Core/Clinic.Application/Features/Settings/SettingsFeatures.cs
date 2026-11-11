using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using Clinic.Domain.ValueObjects;
using MediatR;

namespace Clinic.Application.Features.Settings;

// 1. GetSiteSettingsQuery
public record GetSiteSettingsQuery : IRequest<Result<SiteSettings>>;

public class GetSiteSettingsQueryHandler : IRequestHandler<GetSiteSettingsQuery, Result<SiteSettings>>
{
    private readonly ISiteSettingsRepository _repository;

    public GetSiteSettingsQueryHandler(ISiteSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<SiteSettings>> Handle(GetSiteSettingsQuery request, CancellationToken cancellationToken)
    {
        var settings = await _repository.GetSettingsAsync(cancellationToken);
        return Result<SiteSettings>.Success(settings);
    }
}

// 2. UpdateSiteSettingsCommand
public record UpdateSiteSettingsCommand(
    string ClinicName,
    string DoctorName,
    string DoctorTitle,
    string DoctorBio,
    string Address,
    List<string> PhoneNumbers,
    string WhatsAppNumber,
    string Email,
    string WorkingHours,
    string GoogleMapsEmbedUrl,
    SocialMediaLinks? SocialMedia,
    string? GoogleTagManagerId,
    string? GoogleAnalyticsId,
    string? LegalNotice
) : IRequest<Result<SiteSettings>>;

public class UpdateSiteSettingsCommandHandler : IRequestHandler<UpdateSiteSettingsCommand, Result<SiteSettings>>
{
    private readonly ISiteSettingsRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public UpdateSiteSettingsCommandHandler(
        ISiteSettingsRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<SiteSettings>> Handle(UpdateSiteSettingsCommand request, CancellationToken cancellationToken)
    {
        var current = await _repository.GetSettingsAsync(cancellationToken);

        current.ClinicName = request.ClinicName.Trim();
        current.DoctorName = request.DoctorName.Trim();
        current.DoctorTitle = request.DoctorTitle.Trim();
        current.DoctorBio = request.DoctorBio;
        current.Address = request.Address.Trim();
        current.PhoneNumbers = request.PhoneNumbers;
        current.WhatsAppNumber = request.WhatsAppNumber.Trim();
        current.Email = request.Email.Trim();
        current.WorkingHours = request.WorkingHours.Trim();
        current.GoogleMapsEmbedUrl = request.GoogleMapsEmbedUrl.Trim();
        current.SocialMedia = request.SocialMedia ?? current.SocialMedia;
        current.GoogleTagManagerId = request.GoogleTagManagerId;
        current.GoogleAnalyticsId = request.GoogleAnalyticsId;
        if (!string.IsNullOrWhiteSpace(request.LegalNotice))
        {
            current.LegalNotice = request.LegalNotice.Trim();
        }
        current.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateSettingsAsync(current, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", "/iletisim", "/hakkimda" }, cancellationToken);

        return Result<SiteSettings>.Success(current, "Klinik ayarları başarıyla güncellendi.");
    }
}

