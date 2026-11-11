using System.Net;
using System.Text.Json;
using Clinic.Application.Common.Models;
using FluentValidation;

namespace Clinic.WebAPI.Middlewares;

public class GlobalExceptionMiddleware
{
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
        catch (ValidationException validationEx)
        {
            var errors = validationEx.Errors
                .Select(e => e.ErrorMessage)
                .Distinct()
                .ToList();

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

            var response = Result.Failure("Doğrulama hatası oluştu.", errors);
            await WriteJsonResponseAsync(context, response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "İşlenmeyen bir sunucu hatası oluştu: {Path}", context.Request.Path);

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = Result.Failure("Sunucu tarafında beklenmeyen bir hata oluştu.");
            await WriteJsonResponseAsync(context, response);
        }
    }

    private static async Task WriteJsonResponseAsync(HttpContext context, Result result)
    {
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        var json = JsonSerializer.Serialize(result, jsonOptions);
        await context.Response.WriteAsync(json);
    }
}

