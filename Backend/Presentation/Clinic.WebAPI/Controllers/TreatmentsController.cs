using Clinic.Application.Features.Treatments;
using Clinic.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Clinic.WebAPI.Controllers;

public class TreatmentsController : BaseApiController
{
    public TreatmentsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? categorySlug = null,
        [FromQuery] bool onlyPublished = true,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllTreatmentsQuery(categorySlug, onlyPublished), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetTreatmentBySlugQuery(slug), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> Create([FromBody] CreateTreatmentCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return CreatedOrBadRequest(result, nameof(GetBySlug), new { slug = result.Data?.Slug });
    }

    [Authorize]
    [HttpPut("{id}")]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateTreatmentCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command with { Id = id }, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpPatch("{id}/toggle-publish")]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> TogglePublish(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new ToggleTreatmentPublishCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new DeleteTreatmentCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }
}
