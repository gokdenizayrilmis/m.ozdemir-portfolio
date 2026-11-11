using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using Clinic.Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Categories;

// 1. GetAllCategoriesQuery
public record GetAllCategoriesQuery : IRequest<Result<List<Category>>>;

public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, Result<List<Category>>>
{
    private readonly ICategoryRepository _repository;

    public GetAllCategoriesQueryHandler(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<Category>>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _repository.GetAllAsync(cancellationToken);
        return Result<List<Category>>.Success(categories);
    }
}

// 2. GetCategoryBySlugQuery
public record GetCategoryBySlugQuery(string Slug) : IRequest<Result<Category>>;

public class GetCategoryBySlugQueryHandler : IRequestHandler<GetCategoryBySlugQuery, Result<Category>>
{
    private readonly ICategoryRepository _repository;

    public GetCategoryBySlugQueryHandler(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Category>> Handle(GetCategoryBySlugQuery request, CancellationToken cancellationToken)
    {
        var category = await _repository.GetBySlugAsync(request.Slug, cancellationToken);
        if (category is null)
        {
            return Result<Category>.Failure($"'{request.Slug}' adresine sahip kategori bulunamadı.");
        }

        return Result<Category>.Success(category);
    }
}

// 3. CreateCategoryCommand
public record CreateCategoryCommand(
    string Title,
    string Slug,
    string Description,
    int DisplayOrder,
    SeoMetadata? Seo
) : IRequest<Result<Category>>;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Kategori adı zorunludur.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("Kategori Slug alanı zorunludur.");
    }
}

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<Category>>
{
    private readonly ICategoryRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public CreateCategoryCommandHandler(
        ICategoryRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<Category>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, null, cancellationToken))
        {
            return Result<Category>.Failure($"'{normalizedSlug}' URL slug değeri zaten başka bir kategoride kullanılıyor.");
        }

        var category = new Category
        {
            Title = request.Title.Trim(),
            Slug = normalizedSlug,
            Description = request.Description.Trim(),
            DisplayOrder = request.DisplayOrder,
            Seo = request.Seo ?? new SeoMetadata
            {
                MetaTitle = $"{request.Title.Trim()} | Prof. Dr. Mustafa Özdemir",
                MetaDescription = request.Description.Trim()
            }
        };

        await _repository.CreateAsync(category, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", $"/kategori/{category.Slug}" }, cancellationToken);

        return Result<Category>.Success(category, "Kategori başarıyla oluşturuldu.");
    }
}

// 4. UpdateCategoryCommand
public record UpdateCategoryCommand(
    string Id,
    string Title,
    string Slug,
    string Description,
    int DisplayOrder,
    SeoMetadata? Seo
) : IRequest<Result<Category>>;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result<Category>>
{
    private readonly ICategoryRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public UpdateCategoryCommandHandler(
        ICategoryRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<Category>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result<Category>.Failure("Güncellenecek kategori bulunamadı.");
        }

        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, request.Id, cancellationToken))
        {
            return Result<Category>.Failure($"'{normalizedSlug}' URL slug değeri başka bir kategoride kullanılıyor.");
        }

        existing.Title = request.Title.Trim();
        existing.Slug = normalizedSlug;
        existing.Description = request.Description.Trim();
        existing.DisplayOrder = request.DisplayOrder;
        existing.Seo = request.Seo ?? existing.Seo;
        existing.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(existing, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", $"/kategori/{existing.Slug}" }, cancellationToken);

        return Result<Category>.Success(existing, "Kategori başarıyla güncellendi.");
    }
}

// 5. DeleteCategoryCommand
public record DeleteCategoryCommand(string Id) : IRequest<Result>;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Result>
{
    private readonly ICategoryRepository _repository;

    public DeleteCategoryCommandHandler(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result.Failure("Silinecek kategori bulunamadı.");
        }

        await _repository.DeleteAsync(request.Id, cancellationToken);
        return Result.Success("Kategori başarıyla silindi.");
    }
}

