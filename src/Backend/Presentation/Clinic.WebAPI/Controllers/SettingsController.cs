using Clinic.Application.Features.Settings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetSiteSettingsQuery(), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSiteSettingsCommand command, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result) : BadRequest(result);
    }
}

