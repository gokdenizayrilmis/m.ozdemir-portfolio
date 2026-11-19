using System.Net;
using System.Text.Json;
using Clinic.Application.Common.Models;
using FluentValidation;

namespace Clinic.WebAPI.Middlewares;

public class GlobalExceptionMiddleware
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            _logger.LogDebug("İstek istemci tarafından iptal edildi: {Path}", context.Request.Path);
            if (!context.Response.HasStarted)
            {
                context.Response.StatusCode = 499;
            }
        }
        catch (ValidationException validationEx)
        {
            var errors = validationEx.Errors
                .Select(e => e.ErrorMessage)
                .Distinct()
                .ToList();

            await WriteErrorResponseAsync(
                context,
                HttpStatusCode.BadRequest,
                Result.Failure("Doğrulama hatası oluştu.", errors));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Yetkisiz erişim girişimi: {Path}", context.Request.Path);
            await WriteErrorResponseAsync(
                context,
                HttpStatusCode.Forbidden,
                Result.Failure(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İşlenmeyen bir sunucu hatası oluştu: {Path}", context.Request.Path);
            await WriteErrorResponseAsync(
                context,
                HttpStatusCode.InternalServerError,
                Result.Failure("Sunucu tarafında beklenmeyen bir hata oluştu."));
        }
    }

    private static async Task WriteErrorResponseAsync(HttpContext context, HttpStatusCode statusCode, Result result)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var json = JsonSerializer.Serialize(result, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}
