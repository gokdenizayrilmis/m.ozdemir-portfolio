using Clinic.Application.Features.Leads;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

public class LeadsController : BaseApiController
{
    public LeadsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpPost("track-click")]
    public async Task<IActionResult> TrackClick(
        [FromBody] TrackClickCommand command,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] string range = "30d",
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetLeadsSummaryQuery(range), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string range = "all",
        [FromQuery] string? type = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 25,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetPagedLeadsQuery(range, type, page, pageSize), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("export")]
    public async Task<IActionResult> ExportCsv(
        [FromQuery] string range = "all",
        [FromQuery] string? type = null,
        CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new ExportLeadsCsvQuery(range, type), cancellationToken);
        if (!result.IsSuccess || result.Data is null)
        {
            return BadRequest(result);
        }

        var fileName = $"donusum-kayitlari-{DateTime.UtcNow.AddHours(3):yyyyMMdd-HHmm}.csv";
        return File(result.Data, "text/csv; charset=utf-8", fileName);
    }
}
