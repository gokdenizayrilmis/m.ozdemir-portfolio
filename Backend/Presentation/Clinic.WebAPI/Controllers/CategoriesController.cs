using Clinic.Application.Features.Categories;
using Clinic.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Clinic.WebAPI.Controllers;

public class CategoriesController : BaseApiController
{
    public CategoriesController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllCategoriesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetCategoryBySlugQuery(slug), cancellationToken);
        return OkOrNotFound(result);
    }
}
