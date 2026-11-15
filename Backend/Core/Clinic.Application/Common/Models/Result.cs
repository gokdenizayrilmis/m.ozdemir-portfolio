namespace Clinic.Application.Common.Models;

public class Result
{
    public bool IsSuccess { get; protected init; }
    public string Message { get; protected init; } = string.Empty;
    public List<string> Errors { get; protected init; } = new();

    public static Result Success(string message = "İşlem başarılı.") => new()
    {
        IsSuccess = true,
        Message = message
    };

    public static Result Failure(string message, List<string>? errors = null) => new()
    {
        IsSuccess = false,
        Message = message,
        Errors = errors ?? new List<string> { message }
    };
}

public class Result<T> : Result
{
    public T? Data { get; private init; }

    public static Result<T> Success(T data, string message = "İşlem başarılı.") => new()
    {
        IsSuccess = true,
        Data = data,
        Message = message
    };

    public new static Result<T> Failure(string message, List<string>? errors = null) => new()
    {
        IsSuccess = false,
        Data = default,
        Message = message,
        Errors = errors ?? new List<string> { message }
    };
}

