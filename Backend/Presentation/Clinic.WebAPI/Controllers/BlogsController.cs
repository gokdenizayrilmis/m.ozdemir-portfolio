using Clinic.Application.Features.Blogs;
using Clinic.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Clinic.WebAPI.Controllers;

public class BlogsController : BaseApiController
{
    public BlogsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? tag = null,
        [FromQuery] bool onlyPublished = true,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllBlogsQuery(tag, onlyPublished), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetBlogBySlugQuery(slug), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> Create([FromBody] CreateBlogCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedOrBadRequest(result, nameof(GetBySlug), new { slug = result.Data?.Slug });
    }

    [Authorize]
    [HttpPut("{id}")]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateBlogCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command with { Id = id }, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpPatch("{id}/toggle-publish")]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> TogglePublish(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new ToggleBlogPublishCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new DeleteBlogCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }
}
