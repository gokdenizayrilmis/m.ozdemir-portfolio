namespace Clinic.Application.Common.Extensions;

public static class NormalizationExtensions
{
    private static readonly TimeSpan TurkeyUtcOffset = TimeSpan.FromHours(3);

    public static string ToNormalizedSlug(this string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();

    public static string ToNormalizedEmail(this string? value) =>
        string.IsNullOrWhiteSpace(value) ? string.Empty : value.Trim().ToLowerInvariant();

    public static DateTime ToTurkeyTime(this DateTime utcDateTime) =>
        utcDateTime.Add(TurkeyUtcOffset);

    public static DateTime TurkeyNowUtcOffset() =>
        DateTime.UtcNow.Add(TurkeyUtcOffset);
}
