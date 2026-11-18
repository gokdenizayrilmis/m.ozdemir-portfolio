using Clinic.Application.Features.Categories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

public class CategoriesController : BaseApiController
{
    public CategoriesController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllCategoriesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetCategoryBySlugQuery(slug), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedOrBadRequest(result, nameof(GetBySlug), new { slug = result.Data?.Slug });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateCategoryCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command with { Id = id }, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new DeleteCategoryCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }
}
