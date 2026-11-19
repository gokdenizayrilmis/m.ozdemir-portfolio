using System.Text;
using Clinic.Application.Common.Extensions;
using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Constants;
using Clinic.Domain.Entities;
using MediatR;

namespace Clinic.Application.Features.Leads;

public record CampaignClickStatDto(string Campaign, int Count);

public record PageClickStatDto(string PageSlug, int Count);

public record DailyTrendPointDto(
    string Date,
    string Label,
    int WhatsApp,
    int Phone,
    int Total
);

public record HourlyClickStatDto(
    int Hour,
    string Label,
    int WhatsApp,
    int Phone,
    int Total
);

public record PreviousPeriodComparisonDto(
    int PreviousTotalClicks,
    int PreviousWhatsAppClicks,
    int PreviousPhoneClicks,
    double? TotalChangePercent,
    double? WhatsAppChangePercent,
    double? PhoneChangePercent
);

public record LeadsSummaryDto(
    int TotalClicks,
    int WhatsAppClicks,
    int PhoneClicks,
    List<CampaignClickStatDto> ByCampaign,
    List<PageClickStatDto> ByPage,
    List<DailyTrendPointDto> DailyTrend,
    List<HourlyClickStatDto> HourlyDistribution,
    int BusinessHoursClicks,
    int AfterHoursClicks,
    PreviousPeriodComparisonDto? PreviousPeriod,
    int? PreviousTotalClicks,
    double? TotalChangePercent,
    double? WhatsAppChangePercent,
    double? PhoneChangePercent
);

public record PagedLeadsResponse(
    List<Lead> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public static class LeadRangeHelper
{
    private static readonly string[] TrMonths =
    {
        "Oca", "Şub", "Mar", "Nis", "May", "Haz",
        "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"
    };

    public static DateTime? ParseRangeToUtc(string? range)
    {
        var normalized = (range ?? "30d").Trim().ToLowerInvariant();
        var trNow = NormalizationExtensions.TurkeyNowUtcOffset();

        return normalized switch
        {
            "today" => new DateTime(trNow.Year, trNow.Month, trNow.Day, 0, 0, 0, DateTimeKind.Utc).AddHours(-3),
            "7d" => new DateTime(trNow.Year, trNow.Month, trNow.Day, 0, 0, 0, DateTimeKind.Utc).AddDays(-6).AddHours(-3),
            "30d" => new DateTime(trNow.Year, trNow.Month, trNow.Day, 0, 0, 0, DateTimeKind.Utc).AddDays(-29).AddHours(-3),
            "month" => new DateTime(trNow.Year, trNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddHours(-3),
            "all" => null,
            _ => new DateTime(trNow.Year, trNow.Month, trNow.Day, 0, 0, 0, DateTimeKind.Utc).AddDays(-29).AddHours(-3)
        };
    }

    public static (DateTime PrevFromUtc, DateTime PrevToUtc)? GetPreviousPeriodWindowUtc(string? range)
    {
        var normalized = (range ?? "30d").Trim().ToLowerInvariant();
        var currentFromUtc = ParseRangeToUtc(normalized);
        if (!currentFromUtc.HasValue || normalized == "all")
        {
            return null;
        }

        return normalized switch
        {
            "today" => (currentFromUtc.Value.AddDays(-1), currentFromUtc.Value),
            "7d" => (currentFromUtc.Value.AddDays(-7), currentFromUtc.Value),
            "30d" => (currentFromUtc.Value.AddDays(-30), currentFromUtc.Value),
            "month" => (currentFromUtc.Value.AddMonths(-1), currentFromUtc.Value),
            _ => (currentFromUtc.Value.AddDays(-30), currentFromUtc.Value)
        };
    }

    public static List<DailyTrendPointDto> BuildDailyTrend(
        string? range,
        List<LeadDailyTypeCount> dailyByType,
        List<LeadHourlyTypeCount> hourlyByType)
    {
        var normalized = (range ?? "30d").Trim().ToLowerInvariant();
        var trNow = NormalizationExtensions.TurkeyNowUtcOffset();

        if (normalized == "today")
        {
            var points = new List<DailyTrendPointDto>(24);
            var todayDate = trNow.Date;
            var maxHour = Math.Max(trNow.Hour, 23);

            var hourMap = hourlyByType
                .GroupBy(x => x.Hour)
                .ToDictionary(g => g.Key, g => g.ToList());

            for (var hour = 0; hour <= maxHour; hour++)
            {
                var wa = 0;
                var ph = 0;
                if (hourMap.TryGetValue(hour, out var bucket))
                {
                    wa = bucket.Where(x => IsWhatsApp(x.ConversionType)).Sum(x => x.Count);
                    ph = bucket.Where(x => IsPhone(x.ConversionType)).Sum(x => x.Count);
                }

                points.Add(new DailyTrendPointDto(
                    $"{todayDate:yyyy-MM-dd} {hour:D2}:00",
                    $"{hour:D2}:00",
                    wa,
                    ph,
                    wa + ph));
            }

            return points;
        }

        var endDateTr = trNow.Date;
        DateTime startDateTr;

        switch (normalized)
        {
            case "7d":
                startDateTr = endDateTr.AddDays(-6);
                break;
            case "30d":
                startDateTr = endDateTr.AddDays(-29);
                break;
            case "month":
                startDateTr = new DateTime(trNow.Year, trNow.Month, 1);
                break;
            case "all":
                if (dailyByType.Count > 0)
                {
                    var earliestStr = dailyByType.Min(x => x.Date);
                    var earliestTr = DateTime.TryParse(earliestStr, out var parsed) ? parsed.Date : endDateTr.AddDays(-13);
                    var minFloor = endDateTr.AddDays(-89);
                    startDateTr = earliestTr < minFloor ? minFloor : earliestTr;
                    if ((endDateTr - startDateTr).TotalDays < 13)
                    {
                        startDateTr = endDateTr.AddDays(-13);
                    }
                }
                else
                {
                    startDateTr = endDateTr.AddDays(-13);
                }
                break;
            default:
                startDateTr = endDateTr.AddDays(-29);
                break;
        }

        var groupedByDay = dailyByType
            .GroupBy(x => x.Date)
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<DailyTrendPointDto>();
        for (var day = startDateTr; day <= endDateTr; day = day.AddDays(1))
        {
            var dayKey = day.ToString("yyyy-MM-dd");
            var wa = 0;
            var ph = 0;

            if (groupedByDay.TryGetValue(dayKey, out var dayBuckets))
            {
                wa = dayBuckets.Where(x => IsWhatsApp(x.ConversionType)).Sum(x => x.Count);
                ph = dayBuckets.Where(x => IsPhone(x.ConversionType)).Sum(x => x.Count);
            }

            var label = $"{day.Day} {TrMonths[day.Month - 1]}";
            result.Add(new DailyTrendPointDto(
                dayKey,
                label,
                wa,
                ph,
                wa + ph));
        }

        return result;
    }

    public static List<HourlyClickStatDto> BuildHourlyDistribution(List<LeadHourlyTypeCount> hourlyByType)
    {
        var groupedByHour = hourlyByType
            .GroupBy(x => x.Hour)
            .ToDictionary(g => g.Key, g => g.ToList());

        var points = new List<HourlyClickStatDto>(24);
        for (var hour = 0; hour < 24; hour++)
        {
            var wa = 0;
            var ph = 0;
            if (groupedByHour.TryGetValue(hour, out var hourBuckets))
            {
                wa = hourBuckets.Where(x => IsWhatsApp(x.ConversionType)).Sum(x => x.Count);
                ph = hourBuckets.Where(x => IsPhone(x.ConversionType)).Sum(x => x.Count);
            }

            points.Add(new HourlyClickStatDto(
                hour,
                $"{hour:D2}:00",
                wa,
                ph,
                wa + ph));
        }

        return points;
    }

    public static double CalculateChangePercent(int current, int previous)
    {
        if (previous <= 0)
        {
            return current > 0 ? 100.0 : 0.0;
        }

        return Math.Round(((double)(current - previous) / previous) * 100.0, 1);
    }

    private static bool IsWhatsApp(string conversionType) =>
        string.Equals(conversionType, LeadConversionTypes.WhatsAppClick, StringComparison.OrdinalIgnoreCase);

    private static bool IsPhone(string conversionType) =>
        string.Equals(conversionType, LeadConversionTypes.PhoneClick, StringComparison.OrdinalIgnoreCase);
}

// 1. TrackClickCommand (Google Ads & Conversion Micro-Tracking)
public record TrackClickCommand(
    string ConversionType, // WhatsAppClick, PhoneClick
    string SourcePageSlug,
    string? UtmSource = null,
    string? UtmMedium = null,
    string? UtmCampaign = null
) : IRequest<Result<Lead>>;

public class TrackClickCommandHandler : IRequestHandler<TrackClickCommand, Result<Lead>>
{
    private readonly ILeadRepository _repository;

    public TrackClickCommandHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Lead>> Handle(TrackClickCommand request, CancellationToken cancellationToken)
    {
        var conversionType = string.IsNullOrWhiteSpace(request.ConversionType)
            ? LeadConversionTypes.WhatsAppClick
            : request.ConversionType.Trim();
        var sourcePageSlug = string.IsNullOrWhiteSpace(request.SourcePageSlug)
            ? "/"
            : request.SourcePageSlug.Trim();

        var lead = new Lead
        {
            FullName = $"[Dönüşüm] {conversionType}",
            Phone = "-",
            Subject = $"{conversionType} Tıklaması",
            Message = $"Kullanıcı '{sourcePageSlug}' sayfasından '{conversionType}' butonuna tıkladı.",
            SourcePageSlug = sourcePageSlug,
            ConversionType = conversionType,
            UtmSource = request.UtmSource?.Trim(),
            UtmMedium = request.UtmMedium?.Trim(),
            UtmCampaign = request.UtmCampaign?.Trim(),
            IsRead = false
        };

        await _repository.CreateAsync(lead, cancellationToken);
        return Result<Lead>.Success(lead, "Dönüşüm tıklaması başarıyla kaydedildi.");
    }
}

// 2. GetLeadsSummaryQuery
public record GetLeadsSummaryQuery(string Range = "30d") : IRequest<Result<LeadsSummaryDto>>;

public class GetLeadsSummaryQueryHandler : IRequestHandler<GetLeadsSummaryQuery, Result<LeadsSummaryDto>>
{
    private readonly ILeadRepository _repository;

    public GetLeadsSummaryQueryHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<LeadsSummaryDto>> Handle(GetLeadsSummaryQuery request, CancellationToken cancellationToken)
    {
        var fromUtc = LeadRangeHelper.ParseRangeToUtc(request.Range);
        var currentAgg = await _repository.GetSummaryAggregationAsync(
            fromUtc,
            null,
            includeBreakdowns: true,
            cancellationToken);

        var whatsAppClicks = currentAgg.WhatsAppClicks;
        var phoneClicks = currentAgg.PhoneClicks;
        var totalClicks = whatsAppClicks + phoneClicks;

        var byCampaign = currentAgg.ByCampaign
            .Select(x => new CampaignClickStatDto(
                string.IsNullOrWhiteSpace(x.Name) ? "Organik / Doğrudan Ziyaret" : x.Name,
                x.Count))
            .GroupBy(x => x.Campaign)
            .Select(g => new CampaignClickStatDto(g.Key, g.Sum(i => i.Count)))
            .OrderByDescending(x => x.Count)
            .ToList();

        var byPage = currentAgg.ByPage
            .Select(x => new PageClickStatDto(
                string.IsNullOrWhiteSpace(x.Name) ? "/" : x.Name,
                x.Count))
            .GroupBy(x => x.PageSlug)
            .Select(g => new PageClickStatDto(g.Key, g.Sum(i => i.Count)))
            .OrderByDescending(x => x.Count)
            .ToList();

        var dailyTrend = LeadRangeHelper.BuildDailyTrend(request.Range, currentAgg.DailyByType, currentAgg.HourlyByType);
        var hourlyDistribution = LeadRangeHelper.BuildHourlyDistribution(currentAgg.HourlyByType);
        var businessHoursClicks = hourlyDistribution
            .Where(x => x.Hour >= 9 && x.Hour < 19)
            .Sum(x => x.Total);
        var afterHoursClicks = Math.Max(0, totalClicks - businessHoursClicks);

        PreviousPeriodComparisonDto? previousPeriod = null;
        var prevWindow = LeadRangeHelper.GetPreviousPeriodWindowUtc(request.Range);
        if (prevWindow.HasValue)
        {
            var prevAgg = await _repository.GetSummaryAggregationAsync(
                prevWindow.Value.PrevFromUtc,
                prevWindow.Value.PrevToUtc,
                includeBreakdowns: false,
                cancellationToken);

            var prevWa = prevAgg.WhatsAppClicks;
            var prevPh = prevAgg.PhoneClicks;
            var prevTotal = prevWa + prevPh;

            previousPeriod = new PreviousPeriodComparisonDto(
                prevTotal,
                prevWa,
                prevPh,
                LeadRangeHelper.CalculateChangePercent(totalClicks, prevTotal),
                LeadRangeHelper.CalculateChangePercent(whatsAppClicks, prevWa),
                LeadRangeHelper.CalculateChangePercent(phoneClicks, prevPh));
        }

        var summary = new LeadsSummaryDto(
            totalClicks,
            whatsAppClicks,
            phoneClicks,
            byCampaign,
            byPage,
            dailyTrend,
            hourlyDistribution,
            businessHoursClicks,
            afterHoursClicks,
            previousPeriod,
            previousPeriod?.PreviousTotalClicks,
            previousPeriod?.TotalChangePercent,
            previousPeriod?.WhatsAppChangePercent,
            previousPeriod?.PhoneChangePercent);

        return Result<LeadsSummaryDto>.Success(summary);
    }
}

// 3. GetPagedLeadsQuery
public record GetPagedLeadsQuery(
    string Range = "all",
    string? Type = null,
    int Page = 1,
    int PageSize = 10,
    string? Search = null
) : IRequest<Result<PagedLeadsResponse>>;

public class GetPagedLeadsQueryHandler : IRequestHandler<GetPagedLeadsQuery, Result<PagedLeadsResponse>>
{
    private readonly ILeadRepository _repository;

    public GetPagedLeadsQueryHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PagedLeadsResponse>> Handle(GetPagedLeadsQuery request, CancellationToken cancellationToken)
    {
        var safePage = request.Page < 1 ? 1 : request.Page;
        var safePageSize = request.PageSize < 1 ? 10 : (request.PageSize > 200 ? 200 : request.PageSize);
        var fromUtc = LeadRangeHelper.ParseRangeToUtc(request.Range);

        var (items, totalCount) = await _repository.GetPagedAsync(
            fromUtc,
            request.Type,
            safePage,
            safePageSize,
            request.Search,
            cancellationToken);

        var response = new PagedLeadsResponse(items, totalCount, safePage, safePageSize);
        return Result<PagedLeadsResponse>.Success(response);
    }
}

// 4. ExportLeadsCsvQuery
public record ExportLeadsCsvQuery(
    string Range = "all",
    string? Type = null
) : IRequest<Result<byte[]>>;

public class ExportLeadsCsvQueryHandler : IRequestHandler<ExportLeadsCsvQuery, Result<byte[]>>
{
    private readonly ILeadRepository _repository;

    public ExportLeadsCsvQueryHandler(ILeadRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<byte[]>> Handle(ExportLeadsCsvQuery request, CancellationToken cancellationToken)
    {
        var fromUtc = LeadRangeHelper.ParseRangeToUtc(request.Range);
        var leads = await _repository.GetFilteredAsync(fromUtc, null, request.Type, cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Tarih (TR),Dönüşüm Tipi,Kaynak Sayfa,UTM Source,UTM Medium,UTM Campaign");

        foreach (var lead in leads)
        {
            var trTime = lead.CreatedAt.ToTurkeyTime().ToString("yyyy-MM-dd HH:mm:ss");
            var typeLabel = lead.ConversionType == LeadConversionTypes.WhatsAppClick
                ? "WhatsApp Tıklaması"
                : lead.ConversionType == LeadConversionTypes.PhoneClick
                    ? "Telefon Araması"
                    : lead.ConversionType;

            sb.AppendLine(string.Join(",",
                EscapeCsv(trTime),
                EscapeCsv(typeLabel),
                EscapeCsv(string.IsNullOrWhiteSpace(lead.SourcePageSlug) ? "/" : lead.SourcePageSlug),
                EscapeCsv(lead.UtmSource ?? "-"),
                EscapeCsv(lead.UtmMedium ?? "-"),
                EscapeCsv(lead.UtmCampaign ?? "Organik / Doğrudan")));
        }

        var utf8WithBom = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true);
        var csvBytes = utf8WithBom.GetBytes(sb.ToString());

        return Result<byte[]>.Success(csvBytes);
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value)) return "\"\"";
        var escaped = value.Replace("\"", "\"\"");
        return $"\"{escaped}\"";
    }
}
