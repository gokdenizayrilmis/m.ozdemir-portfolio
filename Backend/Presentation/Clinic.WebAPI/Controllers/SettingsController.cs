using Clinic.Application.Features.Settings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

public class SettingsController : BaseApiController
{
    public SettingsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetSiteSettingsQuery(), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSiteSettingsCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkOrBadRequest(result);
    }
}
