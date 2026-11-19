using Clinic.Application.Features.Settings;
using Clinic.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Clinic.WebAPI.Controllers;

public class SettingsController : BaseApiController
{
    public SettingsController(IMediator mediator) : base(mediator)
    {
    }

    [HttpGet]
    [EnableRateLimiting(RateLimitPolicies.PublicRead)]
    public async Task<IActionResult> GetSettings(CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(new GetSiteSettingsQuery(), cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPut]
    [EnableRateLimiting(RateLimitPolicies.AdminWrite)]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSiteSettingsCommand command, CancellationToken cancellationToken = default)
    {
        var result = await Mediator.Send(command, cancellationToken);
        return OkOrBadRequest(result);
    }
}
