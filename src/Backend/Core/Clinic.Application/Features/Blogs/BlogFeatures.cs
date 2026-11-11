using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using Clinic.Domain.ValueObjects;
using FluentValidation;
using MediatR;

namespace Clinic.Application.Features.Blogs;

// 1. GetAllBlogsQuery
public record GetAllBlogsQuery(string? Tag = null, bool OnlyPublished = true)
    : IRequest<Result<List<BlogPost>>>;

public class GetAllBlogsQueryHandler : IRequestHandler<GetAllBlogsQuery, Result<List<BlogPost>>>
{
    private readonly IBlogPostRepository _repository;

    public GetAllBlogsQueryHandler(IBlogPostRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<BlogPost>>> Handle(GetAllBlogsQuery request, CancellationToken cancellationToken)
    {
        var blogs = await _repository.GetAllAsync(request.Tag, request.OnlyPublished, cancellationToken);
        return Result<List<BlogPost>>.Success(blogs);
    }
}

// 2. GetBlogBySlugQuery
public record GetBlogBySlugQuery(string Slug) : IRequest<Result<BlogPost>>;

public class GetBlogBySlugQueryHandler : IRequestHandler<GetBlogBySlugQuery, Result<BlogPost>>
{
    private readonly IBlogPostRepository _repository;

    public GetBlogBySlugQueryHandler(IBlogPostRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<BlogPost>> Handle(GetBlogBySlugQuery request, CancellationToken cancellationToken)
    {
        var blog = await _repository.GetBySlugAsync(request.Slug, cancellationToken);
        if (blog is null)
        {
            return Result<BlogPost>.Failure($"'{request.Slug}' adresine sahip blog yazısı bulunamadı.");
        }

        return Result<BlogPost>.Success(blog);
    }
}

// 3. CreateBlogCommand
public record CreateBlogCommand(
    string Title,
    string Slug,
    string Summary,
    string HtmlContent,
    string CoverImageUrl,
    string? Author,
    bool IsPublished,
    List<string>? Tags,
    SeoMetadata? Seo
) : IRequest<Result<BlogPost>>;

public class CreateBlogCommandValidator : AbstractValidator<CreateBlogCommand>
{
    public CreateBlogCommandValidator()
    {
        RuleFor(x => x.Title).NotEmpty().WithMessage("Blog başlığı zorunludur.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("URL Slug alanı zorunludur.");
        RuleFor(x => x.Summary).NotEmpty().WithMessage("Özet açıklama zorunludur.");
        RuleFor(x => x.HtmlContent).NotEmpty().WithMessage("Blog içeriği zorunludur.");
    }
}

public class CreateBlogCommandHandler : IRequestHandler<CreateBlogCommand, Result<BlogPost>>
{
    private readonly IBlogPostRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public CreateBlogCommandHandler(
        IBlogPostRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<BlogPost>> Handle(CreateBlogCommand request, CancellationToken cancellationToken)
    {
        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, null, cancellationToken))
        {
            return Result<BlogPost>.Failure($"'{normalizedSlug}' URL slug değeri zaten başka bir blog yazısında kullanılıyor.");
        }

        var blog = new BlogPost
        {
            Title = request.Title.Trim(),
            Slug = normalizedSlug,
            Summary = request.Summary.Trim(),
            HtmlContent = request.HtmlContent,
            CoverImageUrl = request.CoverImageUrl,
            Author = string.IsNullOrWhiteSpace(request.Author) ? "Prof. Dr. Mustafa Özdemir" : request.Author.Trim(),
            PublishedAt = DateTime.UtcNow,
            IsPublished = request.IsPublished,
            Tags = request.Tags ?? new List<string>(),
            Seo = request.Seo ?? new SeoMetadata
            {
                MetaTitle = $"{request.Title.Trim()} | Prof. Dr. Mustafa Özdemir",
                MetaDescription = request.Summary.Trim(),
                SchemaType = "MedicalScholarlyArticle"
            }
        };

        await _repository.CreateAsync(blog, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", "/blog", $"/blog/{blog.Slug}" }, cancellationToken);

        return Result<BlogPost>.Success(blog, "Blog yazısı başarıyla oluşturuldu.");
    }
}

// 4. UpdateBlogCommand
public record UpdateBlogCommand(
    string Id,
    string Title,
    string Slug,
    string Summary,
    string HtmlContent,
    string CoverImageUrl,
    string? Author,
    bool IsPublished,
    List<string>? Tags,
    SeoMetadata? Seo
) : IRequest<Result<BlogPost>>;

public class UpdateBlogCommandValidator : AbstractValidator<UpdateBlogCommand>
{
    public UpdateBlogCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("Blog ID zorunludur.");
        RuleFor(x => x.Title).NotEmpty().WithMessage("Blog başlığı zorunludur.");
        RuleFor(x => x.Slug).NotEmpty().WithMessage("URL Slug alanı zorunludur.");
    }
}

public class UpdateBlogCommandHandler : IRequestHandler<UpdateBlogCommand, Result<BlogPost>>
{
    private readonly IBlogPostRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public UpdateBlogCommandHandler(
        IBlogPostRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result<BlogPost>> Handle(UpdateBlogCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result<BlogPost>.Failure("Güncellenecek blog yazısı bulunamadı.");
        }

        var normalizedSlug = request.Slug.Trim().ToLowerInvariant();
        if (await _repository.ExistsBySlugAsync(normalizedSlug, request.Id, cancellationToken))
        {
            return Result<BlogPost>.Failure($"'{normalizedSlug}' URL slug değeri başka bir blog yazısında kullanılıyor.");
        }

        existing.Title = request.Title.Trim();
        existing.Slug = normalizedSlug;
        existing.Summary = request.Summary.Trim();
        existing.HtmlContent = request.HtmlContent;
        existing.CoverImageUrl = request.CoverImageUrl;
        existing.Author = string.IsNullOrWhiteSpace(request.Author) ? existing.Author : request.Author.Trim();
        existing.IsPublished = request.IsPublished;
        existing.Tags = request.Tags ?? new List<string>();
        existing.Seo = request.Seo ?? existing.Seo;
        existing.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(existing, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", "/blog", $"/blog/{existing.Slug}" }, cancellationToken);

        return Result<BlogPost>.Success(existing, "Blog yazısı başarıyla güncellendi.");
    }
}

// 5. DeleteBlogCommand
public record DeleteBlogCommand(string Id) : IRequest<Result>;

public class DeleteBlogCommandHandler : IRequestHandler<DeleteBlogCommand, Result>
{
    private readonly IBlogPostRepository _repository;
    private readonly INextJsRevalidationService _revalidationService;

    public DeleteBlogCommandHandler(
        IBlogPostRepository repository,
        INextJsRevalidationService revalidationService)
    {
        _repository = repository;
        _revalidationService = revalidationService;
    }

    public async Task<Result> Handle(DeleteBlogCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (existing is null)
        {
            return Result.Failure("Silinecek blog yazısı bulunamadı.");
        }

        await _repository.DeleteAsync(request.Id, cancellationToken);
        await _revalidationService.RevalidatePathsAsync(new[] { "/", "/blog", $"/blog/{existing.Slug}" }, cancellationToken);

        return Result.Success("Blog yazısı başarıyla silindi.");
    }
}

