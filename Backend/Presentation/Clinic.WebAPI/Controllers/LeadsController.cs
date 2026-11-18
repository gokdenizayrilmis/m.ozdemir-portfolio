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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLeadCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkOrBadRequest(result);
    }

    [HttpPost("track-click")]
    public async Task<IActionResult> TrackClick([FromBody] TrackClickCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkOrBadRequest(result);
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? isRead = null, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetAllLeadsQuery(isRead), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(string id, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new MarkLeadAsReadCommand(id), cancellationToken);
        return OkOrNotFound(result);
    }
}
