using Clinic.Application.Common.Extensions;
using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using Clinic.Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Treatments;

internal static class TreatmentOrderHelper
{
    public static async Task<int> ReorderAllTreatmentsAsync(
        ITreatmentRepository repository,
        Treatment? currentTreatment,
        int requestedOrder,
        CancellationToken cancellationToken)
    {
        var allTreatments = await repository.GetAllAsync(null, onlyPublished: false, cancellationToken);
        var others = (currentTreatment is null
            ? allTreatments
            : allTreatments.Where(t => t.Id != currentTreatment.Id))
            .OrderBy(t => t.DisplayOrder > 0 ? t.DisplayOrder : int.MaxValue)
            .ThenBy(t => t.Title, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var maxOrder = currentTreatment is null ? others.Count : others.Count + 1;
        var effectiveRequested = requestedOrder > 0 ? requestedOrder : maxOrder;
        var clampedOrder = currentTreatment is null
            ? 0
            : Math.Clamp(effectiveRequested, 1, Math.Max(1, maxOrder));

        var ordered = new List<Treatment>(others);
        if (currentTreatment is not null)
        {
            ordered.Insert(clampedOrder - 1, currentTreatment);
        }

        var now = DateTime.UtcNow;
        for (var i = 0; i < ordered.Count; i++)
        {
            var expectedOrder = i + 1;
            var item = ordered[i];
            if (currentTreatment is not null && item.Id == currentTreatment.Id)
            {
                item.DisplayOrder = expectedOrder;
                continue;
            }

            if (item.DisplayOrder != expectedOrder)
            {
                item.DisplayOrder = expectedOrder;
                item.UpdatedAt = now;
                await repository.UpdateAsync(item, cancellationToken);
            }
        }

        return clampedOrder;
    }
}

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
        var normalizedSlug = request.Slug.ToNormalizedSlug();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, null, cancellationToken))
        {
            return Result<Treatment>.Failure($"'{normalizedSlug}' URL slug değeri zaten başka bir tedavide kullanılıyor.");
        }

        var normalizedCategorySlug = request.CategorySlug.ToNormalizedSlug();
        var treatment = new Treatment
        {
            Title = request.Title.Trim(),
            Slug = normalizedSlug,
            CategoryId = request.CategoryId,
            CategorySlug = normalizedCategorySlug,
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
        treatment.DisplayOrder = await TreatmentOrderHelper.ReorderAllTreatmentsAsync(
            _repository,
            treatment,
            request.DisplayOrder,
            cancellationToken);
        await _repository.UpdateAsync(treatment, cancellationToken);

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

        var oldSlug = existing.Slug;
        var oldCategorySlug = existing.CategorySlug;
        var normalizedSlug = request.Slug.ToNormalizedSlug();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, request.Id, cancellationToken))
        {
            return Result<Treatment>.Failure($"'{normalizedSlug}' URL slug değeri başka bir tedavide kullanılıyor.");
        }

        var newCategorySlug = request.CategorySlug.ToNormalizedSlug();
        existing.Title = request.Title.Trim();
        existing.Slug = normalizedSlug;
        existing.CategoryId = request.CategoryId;
        existing.CategorySlug = newCategorySlug;
        existing.Summary = request.Summary.Trim();
        existing.HtmlContent = request.HtmlContent;
        existing.CoverImageUrl = request.CoverImageUrl;
        existing.IsPublished = request.IsPublished;
        existing.Faqs = request.Faqs ?? new List<FaqItem>();
        existing.Seo = request.Seo ?? existing.Seo;
        existing.UpdatedAt = DateTime.UtcNow;

        existing.DisplayOrder = await TreatmentOrderHelper.ReorderAllTreatmentsAsync(
            _repository,
            existing,
            request.DisplayOrder,
            cancellationToken);

        await _repository.UpdateAsync(existing, cancellationToken);

        await _revalidationService.RevalidatePathsAsync(
            new[] { "/", $"/{oldSlug}", $"/{existing.Slug}", $"/kategori/{oldCategorySlug}", $"/kategori/{existing.CategorySlug}" },
            cancellationToken);

        return Result<Treatment>.Success(existing, "Tedavi sayfası başarıyla güncellendi.");
    }
}

// 5. DeleteTreatmentCommand
public record DeleteTreatmentCommand(string Id) : IRequest<Result>;

public class DeleteTreatmentCommandHandler : IRequestHandler<DeleteTreatmentCommand, Result>
{
    private readonly ITreatmentRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;
    private readonly IImageStorageService _imageStorageService;

    public DeleteTreatmentCommandHandler(
        ITreatmentRepository repository,
        INextJsRevalidationService revalidationService,
        IImageStorageService imageStorageService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
        _imageStorageService = imageStorageService;
    }

    public async Task<Result> Handle(DeleteTreatmentCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result.Failure("Silinecek tedavi kaydı bulunamadı.");
        }

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await TreatmentOrderHelper.ReorderAllTreatmentsAsync(
            _repository,
            null,
            0,
            cancellationToken);

        await _imageStorageService.DeleteNonCorporateImageIfAnyAsync(existing.CoverImageUrl, cancellationToken);

        await _revalidationService.RevalidatePathsAsync(
            new[] { "/", $"/{existing.Slug}", $"/kategori/{existing.CategorySlug}" },
            cancellationToken);

        return Result.Success("Tedavi sayfası başarıyla silindi.");
    }
}

// 6. ToggleTreatmentPublishCommand
public record ToggleTreatmentPublishCommand(string Id) : IRequest<Result<Treatment>>;

public class ToggleTreatmentPublishCommandHandler : IRequestHandler<ToggleTreatmentPublishCommand, Result<Treatment>>
{
    private readonly ITreatmentRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public ToggleTreatmentPublishCommandHandler(
        ITreatmentRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<Treatment>> Handle(ToggleTreatmentPublishCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result<Treatment>.Failure("Durumu değiştirilecek tedavi kaydı bulunamadı.");
        }

        existing.IsPublished = !existing.IsPublished;
        existing.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(existing, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(
            new[] { "/", $"/{existing.Slug}", $"/kategori/{existing.CategorySlug}" },
            cancellationToken);

        var statusMsg = existing.IsPublished
            ? "Tedavi sayfası yayına alındı."
            : "Tedavi sayfası taslağa çekildi (gizlendi).";

        return Result<Treatment>.Success(existing, statusMsg);
    }
}
