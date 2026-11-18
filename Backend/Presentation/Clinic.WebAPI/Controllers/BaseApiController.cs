using Clinic.Application.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Clinic.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    protected readonly IMediator Mediator;

    protected BaseApiController(IMediator mediator)
    {
        Mediator = mediator;
    }

    protected IActionResult OkOrNotFound<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result) : NotFound(result);

    protected IActionResult OkOrNotFound(Result result) =>
        result.IsSuccess ? Ok(result) : NotFound(result);

    protected IActionResult OkOrBadRequest<T>(Result<T> result) =>
        result.IsSuccess ? Ok(result) : BadRequest(result);

    protected IActionResult CreatedOrBadRequest<T>(Result<T> result, string actionName, object routeValues) =>
        result.IsSuccess ? CreatedAtAction(actionName, routeValues, result) : BadRequest(result);
}
