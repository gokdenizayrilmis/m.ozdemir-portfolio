using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Clinic.Application.Common.Models;
using Clinic.Application.Features.Auth;
using Clinic.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Clinic.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _environment;

    public AuthController(IMediator mediator, IWebHostEnvironment environment)
    {
        _mediator = mediator;
        _environment = environment;
    }

    [HttpPost("login")]
    [EnableRateLimiting(RateLimitPolicies.AuthLogin)]
    public async Task<IActionResult> Login([FromBody] LoginAdminCommand command, CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(command, cancellationToken);
        if (!result.IsSuccess || result.Data is null)
        {
            return Unauthorized(Result<AdminAuthResponse>.Failure(result.Message));
        }

        SetRefreshTokenCookie(result.Data.RawRefreshToken, result.Data.RefreshTokenExpiresAt);
        return Ok(Result<AdminAuthResponse>.Success(result.Data.Response, result.Message));
    }

    [HttpPost("refresh")]
    [EnableRateLimiting(RateLimitPolicies.AuthRefresh)]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken = default)
    {
        var rawRefreshToken = Request.Cookies[AuthConstants.RefreshTokenCookieName];
        var result = await _mediator.Send(new RefreshTokenCommand(rawRefreshToken), cancellationToken);

        if (!result.IsSuccess || result.Data is null)
        {
            ClearRefreshTokenCookie();
            return Unauthorized(Result<AdminAuthResponse>.Failure(result.Message));
        }

        SetRefreshTokenCookie(result.Data.RawRefreshToken, result.Data.RefreshTokenExpiresAt);
        return Ok(Result<AdminAuthResponse>.Success(result.Data.Response, result.Message));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken = default)
    {
        var rawRefreshToken = Request.Cookies[AuthConstants.RefreshTokenCookieName];
        var result = await _mediator.Send(new LogoutAdminCommand(rawRefreshToken), cancellationToken);
        ClearRefreshTokenCookie();
        return Ok(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequestDto request,
        CancellationToken cancellationToken = default)
    {
        var adminUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                          ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                          ?? string.Empty;

        var result = await _mediator.Send(
            new ChangeAdminPasswordCommand(adminUserId, request.CurrentPassword, request.NewPassword),
            cancellationToken);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        ClearRefreshTokenCookie();
        return Ok(result);
    }

    private void SetRefreshTokenCookie(string rawToken, DateTime expiresAtUtc)
    {
        Response.Cookies.Append(
            AuthConstants.RefreshTokenCookieName,
            rawToken,
            BuildRefreshCookieOptions(expiresAtUtc));
    }

    private void ClearRefreshTokenCookie()
    {
        Response.Cookies.Delete(
            AuthConstants.RefreshTokenCookieName,
            BuildRefreshCookieOptions());
    }

    private CookieOptions BuildRefreshCookieOptions(DateTime? expiresAtUtc = null)
    {
        var isDevelopment = _environment.IsDevelopment();
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.None,
            Path = AuthConstants.RefreshTokenCookiePath
        };

        if (expiresAtUtc.HasValue)
        {
            options.Expires = new DateTimeOffset(DateTime.SpecifyKind(expiresAtUtc.Value, DateTimeKind.Utc));
        }

        return options;
    }
}
