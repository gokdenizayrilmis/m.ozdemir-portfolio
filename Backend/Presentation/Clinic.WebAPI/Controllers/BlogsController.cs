using Clinic.Application.Features.Blogs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

public class BlogsController : BaseApiController
{
    public BlogsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? tag = null,
        [FromQuery] bool onlyPublished = true,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllBlogsQuery(tag, onlyPublished), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetBlogBySlugQuery(slug), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBlogCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedOrBadRequest(result, nameof(GetBySlug), new { slug = result.Data?.Slug });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateBlogCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command with { Id = id }, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpPatch("{id}/toggle-publish")]
    public async Task<IActionResult> TogglePublish(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new ToggleBlogPublishCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new DeleteBlogCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }
}
