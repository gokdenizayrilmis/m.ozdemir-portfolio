using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
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
