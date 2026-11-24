using Clinic.Application.Common.Extensions;
using Clinic.Application.Features.Leads;
using Clinic.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Clinic.WebAPI.Controllers;

public class LeadsController : BaseApiController
{
    public LeadsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpPost("track-click")]
    [EnableRateLimiting(RateLimitPolicies.LeadsTrack)]
    public async Task<IActionResult> TrackClick(
        [FromBody] TrackClickCommand command,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpGet("summary")]
    [EnableRateLimiting(RateLimitPolicies.AdminRead)]
    public async Task<IActionResult> GetSummary(
        [FromQuery] string range = "30d",
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetLeadsSummaryQuery(range), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.AdminRead)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string range = "all",
        [FromQuery] string? type = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetPagedLeadsQuery(range, type, page, pageSize, search), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("export")]
    [EnableRateLimiting(RateLimitPolicies.AdminHeavy)]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] string range = "30d",
        [FromQuery] string? type = null,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new ExportLeadsCsvQuery(range, type), cancellationToken);
        if (!result.IsSuccess || result.Data is null)
        {
            return BadRequest(result);
        }

        var fileName = $"donusum-raporu-{range}-{NormalizationExtensions.TurkeyNowUtcOffset():yyyyMMdd-HHmm}.xlsx";
        return File(
            result.Data,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }
}
