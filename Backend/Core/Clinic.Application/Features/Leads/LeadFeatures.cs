using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Leads;

// 1. CreateLeadCommand
public record CreateLeadCommand(
    string FullName,
    string Phone,
    string? Email,
    string Subject,
    string Message,
    string SourcePageSlug,
    string ConversionType = "ContactForm",
    string? UtmSource = null,
    string? UtmMedium = null,
    string? UtmCampaign = null
) : IRequest<Result<Lead>>;

public class CreateLeadCommandValidator : AbstractValidator<CreateLeadCommand>
{
    public CreateLeadCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().WithMessage("Ad Soyad alanı zorunludur.");
        RuleFor(x => x.Phone).NotEmpty().WithMessage("Telefon numarası zorunludur.");
    }
}

public class CreateLeadCommandHandler : IRequestHandler<CreateLeadCommand, Result<Lead>>
{
    private readonly ILeadRepository _repository;

    public CreateLeadCommandHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Lead>> Handle(CreateLeadCommand request, CancellationToken cancellationToken)
    {
        var lead = new Lead
        {
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email?.Trim(),
            Subject = request.Subject.Trim(),
            Message = request.Message.Trim(),
            SourcePageSlug = request.SourcePageSlug.Trim(),
            ConversionType = string.IsNullOrWhiteSpace(request.ConversionType) ? "ContactForm" : request.ConversionType.Trim(),
            UtmSource = request.UtmSource?.Trim(),
            UtmMedium = request.UtmMedium?.Trim(),
            UtmCampaign = request.UtmCampaign?.Trim(),
            IsRead = false
        };

        await _repository.CreateAsync(lead, cancellationToken);
        return Result<Lead>.Success(lead, "Talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.");
    }
}

// 2. GetAllLeadsQuery
public record GetAllLeadsQuery(bool? IsRead = null) : IRequest<Result<List<Lead>>>;

public class GetAllLeadsQueryHandler : IRequestHandler<GetAllLeadsQuery, Result<List<Lead>>>
{
    private readonly ILeadRepository _repository;

    public GetAllLeadsQueryHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<Lead>>> Handle(GetAllLeadsQuery request, CancellationToken cancellationToken)
    {
        var leads = await _repository.GetAllAsync(request.IsRead, cancellationToken);
        return Result<List<Lead>>.Success(leads);
    }
}

// 3. TrackClickCommand (Google Ads & Conversion Micro-Tracking)
public record TrackClickCommand(
    string ConversionType, // WhatsAppClick, PhoneClick
    string SourcePageSlug,
    string? UtmSource = null,
    string? UtmMedium = null,
    string? UtmCampaign = null
) : IRequest<Result<Lead>>;

public class TrackClickCommandHandler : IRequestHandler<TrackClickCommand, Result<Lead>>
{
    private readonly ILeadRepository _repository;

    public TrackClickCommandHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Lead>> Handle(TrackClickCommand request, CancellationToken cancellationToken)
    {
        var lead = new Lead
        {
            FullName = $"[Dönüşüm] {request.ConversionType}",
            Phone = "-",
            Subject = $"{request.ConversionType} Tıklaması",
            Message = $"Kullanıcı '{request.SourcePageSlug}' sayfasından '{request.ConversionType}' butonuna tıkladı.",
            SourcePageSlug = request.SourcePageSlug.Trim(),
            ConversionType = request.ConversionType.Trim(),
            UtmSource = request.UtmSource?.Trim(),
            UtmMedium = request.UtmMedium?.Trim(),
            UtmCampaign = request.UtmCampaign?.Trim(),
            IsRead = false
        };

        await _repository.CreateAsync(lead, cancellationToken);
        return Result<Lead>.Success(lead, "Dönüşüm tıklaması başarıyla kaydedildi.");
    }
}

// 4. MarkLeadAsReadCommand
public record MarkLeadAsReadCommand(string Id) : IRequest<Result>;

public class MarkLeadAsReadCommandHandler : IRequestHandler<MarkLeadAsReadCommand, Result>
{
    private readonly ILeadRepository _repository;

    public MarkLeadAsReadCommandHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(MarkLeadAsReadCommand request, CancellationToken cancellationToken)
    {
        var lead = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (lead is null)
        {
            return Result.Failure("İletişim kaydı bulunamadı.");
        }

        lead.IsRead = true;
        lead.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(lead, cancellationToken);

        return Result.Success("İletişim kaydı okundu olarak işaretlendi.");
    }
}

