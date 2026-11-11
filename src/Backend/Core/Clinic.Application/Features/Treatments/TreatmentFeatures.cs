using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using Clinic.Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Treatments;

// 1. GetAllTreatmentsQuery
public record GetAllTreatmentsQuery(string? CategorySlug = null, bool OnlyPublished = true)
    : IRequest<Result<List<Treatment>>>;

public class GetAllTreatmentsQueryHandler : IRequestHandler<GetAllTreatmentsQuery, Result<List<Treatment>>>
{
    private readonly ITreatmentRepository _repository;

    public GetAllTreatmentsQueryHandler(ITreatmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<Treatment>>> Handle(GetAllTreatmentsQuery request, CancellationToken cancellationToken)
    {
        var treatments = await _repository.GetAllAsync(request.CategorySlug, request.OnlyPublished, cancellationToken);
        return Result<List<Treatment>>.Success(treatments);
    }
}

// 2. GetTreatmentBySlugQuery
public record GetTreatmentBySlugQuery(string Slug) : IRequest<Result<Treatment>>;

public class GetTreatmentBySlugQueryHandler : IRequestHandler<GetTreatmentBySlugQuery, Result<Treatment>>
{
    private readonly ITreatmentRepository _repository;

    public GetTreatmentBySlugQueryHandler(ITreatmentRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Treatment>> Handle(GetTreatmentBySlugQuery request, CancellationToken cancellationToken)
    {
        var treatment = await _repository.GetBySlugAsync(request.Slug, cancellationToken);
        if (treatment is null)
        {
            return Result<Treatment>.Failure($"'{request.Slug}' adresine sahip tedavi sayfası bulunamadı.");
        }

        return Result<Treatment>.Success(treatment);
    }
}

// 3. CreateTreatmentCommand
public record CreateTreatmentCommand(
    string Title,
    string Slug,
    string CategoryId,
    string CategorySlug,
    string Summary,
    string HtmlContent,
    string CoverImageUrl,
    int DisplayOrder,
    bool IsPublished,
    List<FaqItem>? Faqs,
    SeoMetadata? Seo
) : IRequest<Result<Treatment>>;

public class CreateTreatmentCommandValidator : AbstractValidator<CreateTreatmentCommand>
{
    public CreateTreatmentCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tedavi başlığı zorunludur.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("URL Slug alanı zorunludur.");
        RuleFor(x => x.CategorySlug).NotEmpty().WithMessage("Kategori bilgisi zorunludur.");
        RuleFor(x => x.Summary).NotEmpty().WithMessage("Özet açıklama zorunludur.");
        RuleFor(x => x.HtmlContent).NotEmpty().WithMessage("Tedavi içeriği zorunludur.");
    }
}

public class CreateTreatmentCommandHandler : IRequestHandler<CreateTreatmentCommand, Result<Treatment>>
{
    private readonly ITreatmentRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public CreateTreatmentCommandHandler(
        ITreatmentRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<Treatment>> Handle(CreateTreatmentCommand request, CancellationToken cancellationToken)
    {
        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, null, cancellationToken))
        {
            return Result<Treatment>.Failure($"'{normalizedSlug}' URL slug değeri zaten başka bir tedavide kullanılıyor.");
        }

        var treatment = new Treatment
        {
            Title = request.Title.Trim(),
            Slug = normalizedSlug,
            CategoryId = request.CategoryId,
            CategorySlug = request.CategorySlug.Trim().ToLowerInvariant(),
            Summary = request.Summary.Trim(),
            HtmlContent = request.HtmlContent,
            CoverImageUrl = request.CoverImageUrl,
            DisplayOrder = request.DisplayOrder,
            IsPublished = request.IsPublished,
            Faqs = request.Faqs ?? new List<FaqItem>(),
            Seo = request.Seo ?? new SeoMetadata
            {
                MetaTitle = $"{request.Title.Trim()} | Prof. Dr. Mustafa Özdemir",
                MetaDescription = request.Summary.Trim()
            }
        };

        await _repository.CreateAsync(treatment, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", $"/{treatment.Slug}", $"/kategori/{treatment.CategorySlug}" }, cancellationToken);

        return Result<Treatment>.Success(treatment, "Tedavi sayfası başarıyla oluşturuldu.");
    }
}

// 4. UpdateTreatmentCommand
public record UpdateTreatmentCommand(
    string Id,
    string Title,
    string Slug,
    string CategoryId,
    string CategorySlug,
    string Summary,
    string HtmlContent,
    string CoverImageUrl,
    int DisplayOrder,
    bool IsPublished,
    List<FaqItem>? Faqs,
    SeoMetadata? Seo
) : IRequest<Result<Treatment>>;

public class UpdateTreatmentCommandValidator : AbstractValidator<UpdateTreatmentCommand>
{
    public UpdateTreatmentCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Tedavi ID zorunludur.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Tedavi başlığı zorunludur.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("URL Slug alanı zorunludur.");
        RuleFor(x => x.CategorySlug).NotEmpty().WithMessage("Kategori bilgisi zorunludur.");
    }
}

public class UpdateTreatmentCommandHandler : IRequestHandler<UpdateTreatmentCommand, Result<Treatment>>
{
    private readonly ITreatmentRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public UpdateTreatmentCommandHandler(
        ITreatmentRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<Treatment>> Handle(UpdateTreatmentCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result<Treatment>.Failure("Güncellenecek tedavi kaydı bulunamadı.");
        }

        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, request.Id, cancellationToken))
        {
            return Result<Treatment>.Failure($"'{normalizedSlug}' URL slug değeri başka bir tedavide kullanılıyor.");
        }

        existing.Title = request.Title.Trim();
        existing.Slug = normalizedSlug;
        existing.CategoryId = request.CategoryId;
        existing.CategorySlug = request.CategorySlug.Trim().ToLowerInvariant();
        existing.Summary = request.Summary.Trim();
        existing.HtmlContent = request.HtmlContent;
        existing.CoverImageUrl = request.CoverImageUrl;
        existing.DisplayOrder = request.DisplayOrder;
        existing.IsPublished = request.IsPublished;
        existing.Faqs = request.Faqs ?? new List<FaqItem>();
        existing.Seo = request.Seo ?? existing.Seo;
        existing.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(existing, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", $"/{existing.Slug}", $"/kategori/{existing.CategorySlug}" }, cancellationToken);

        return Result<Treatment>.Success(existing, "Tedavi sayfası başarıyla güncellendi.");
    }
}

// 5. DeleteTreatmentCommand
public record DeleteTreatmentCommand(string Id) : IRequest<Result>;

public class DeleteTreatmentCommandHandler : IRequestHandler<DeleteTreatmentCommand, Result>
{
    private readonly ITreatmentRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public DeleteTreatmentCommandHandler(
        ITreatmentRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result> Handle(DeleteTreatmentCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result.Failure("Silinecek tedavi kaydı bulunamadı.");
        }

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", $"/{existing.Slug}" }, cancellationToken);

        return Result.Success("Tedavi sayfası başarıyla silindi.");
    }
}

