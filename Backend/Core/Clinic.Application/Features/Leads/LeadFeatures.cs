using System.IO;
using System.Text;
using ClosedXML.Excel;
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

// 4. ExportLeadsCsvQuery (Styled Multi-Sheet Excel .xlsx Report)
public record ExportLeadsCsvQuery(
    string Range = "30d",
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
        var effectiveRange = string.IsNullOrWhiteSpace(request.Range) ? "30d" : request.Range.Trim().ToLowerInvariant();
        var fromUtc = LeadRangeHelper.ParseRangeToUtc(effectiveRange);
        var leads = await _repository.GetFilteredAsync(fromUtc, null, request.Type, cancellationToken);

        var currentAgg = await _repository.GetSummaryAggregationAsync(
            fromUtc,
            null,
            includeBreakdowns: true,
            cancellationToken);

        var whatsAppClicks = currentAgg.WhatsAppClicks;
        var phoneClicks = currentAgg.PhoneClicks;
        var totalClicks = whatsAppClicks + phoneClicks;

        var dailyTrend = LeadRangeHelper.BuildDailyTrend(effectiveRange, currentAgg.DailyByType, currentAgg.HourlyByType);
        var hourlyDistribution = LeadRangeHelper.BuildHourlyDistribution(currentAgg.HourlyByType);
        var businessHoursClicks = hourlyDistribution.Where(x => x.Hour >= 9 && x.Hour < 19).Sum(x => x.Total);
        var afterHoursClicks = Math.Max(0, totalClicks - businessHoursClicks);

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

        var rangeLabel = effectiveRange switch
        {
            "today" => "Bugün (24 Saatlik)",
            "7d" => "Son 7 Gün",
            "30d" => "Son 30 Gün",
            "month" => "Bu Ay",
            "all" => "Tüm Zamanlar",
            _ => "Son 30 Gün"
        };

        var trNow = NormalizationExtensions.TurkeyNowUtcOffset();

        using var workbook = new XLWorkbook();
        workbook.Properties.Title = $"Prof. Dr. Mustafa Özdemir Kliniği - Dönüşüm Raporu ({rangeLabel})";
        workbook.Properties.Author = "Prof. Dr. Mustafa Özdemir Dermatoloji Kliniği";

        // =========================================================================
        // SHEET 1: Etkileşim Kayıtları (Detailed Conversion Logs + KPI Header)
        // =========================================================================
        var wsLeads = workbook.Worksheets.Add("Etkileşim Kayıtları");
        wsLeads.ShowGridLines = true;

        // Title Banner
        wsLeads.Range("A1:G1").Merge();
        wsLeads.Cell("A1").Value = "PROF. DR. MUSTAFA ÖZDEMİR DERMATOLOJİ KLİNİĞİ — KULLANICI ETKİLEŞİM & DÖNÜŞÜM RAPORU";
        wsLeads.Range("A1:G1").Style
            .Font.SetBold(true)
            .Font.SetFontSize(13)
            .Font.SetFontColor(XLColor.White)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0F172A"))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        wsLeads.Row(1).Height = 32;

        // Subtitle Banner
        wsLeads.Range("A2:G2").Merge();
        wsLeads.Cell("A2").Value = $"Rapor Dönemi: {rangeLabel}   |   Oluşturulma Tarihi (TR): {trNow:dd.MM.yyyy HH:mm}   |   Listelenen Kayıt: {leads.Count} Etkileşim";
        wsLeads.Range("A2:G2").Style
            .Font.SetBold(true)
            .Font.SetFontSize(10)
            .Font.SetFontColor(XLColor.FromHtml("#92400E"))
            .Fill.SetBackgroundColor(XLColor.FromHtml("#FEF3C7"))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        wsLeads.Row(2).Height = 22;

        // KPI Summary Cards Row (Rows 4-5)
        var waPct = totalClicks > 0 ? Math.Round((double)whatsAppClicks / totalClicks * 100, 1) : 0;
        var phPct = totalClicks > 0 ? Math.Round((double)phoneClicks / totalClicks * 100, 1) : 0;
        var bizPct = totalClicks > 0 ? Math.Round((double)businessHoursClicks / totalClicks * 100, 1) : 0;

        StyleKpiBlock(wsLeads, "A4:B4", "A5:B5", "TOPLAM ETKİLEŞİM", $"{totalClicks} Tıklama", "#1E293B", "#F8FAFC", "#0F172A");
        StyleKpiBlock(wsLeads, "C4:D4", "C5:D5", "WHATSAPP RANDEVU", $"{whatsAppClicks} (%{waPct})", "#065F46", "#ECFDF5", "#047857");
        StyleKpiBlock(wsLeads, "E4:F4", "E5:F5", "TELEFON ARAMASI", $"{phoneClicks} (%{phPct})", "#3730A3", "#EEF2FF", "#4338CA");
        StyleKpiBlock(wsLeads, "G4:G4", "G5:G5", "MESAİ İÇİ / DIŞI (09-19)", $"{businessHoursClicks} İçi (%{bizPct}) / {afterHoursClicks} Dışı", "#92400E", "#FFFBEB", "#B45309");
        wsLeads.Row(4).Height = 18;
        wsLeads.Row(5).Height = 24;

        // Table Headers (Row 7)
        const int headerRow = 7;
        var headers = new[]
        {
            "#",
            "Tarih & Saat (TR)",
            "Etkileşim Kanalı",
            "Mesai Durumu",
            "Kaynak Sayfa (Slug)",
            "Reklam Kaynağı / Mecra",
            "Kampanya (UTM Campaign)"
        };

        for (var col = 0; col < headers.Length; col++)
        {
            var cell = wsLeads.Cell(headerRow, col + 1);
            cell.Value = headers[col];
            cell.Style
                .Font.SetBold(true)
                .Font.SetFontSize(10.5)
                .Font.SetFontColor(XLColor.White)
                .Fill.SetBackgroundColor(XLColor.FromHtml("#1E293B"))
                .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
                .Alignment.SetHorizontal(col == 0 ? XLAlignmentHorizontalValues.Center : XLAlignmentHorizontalValues.Left)
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetOutsideBorderColor(XLColor.FromHtml("#334155"));
        }
        wsLeads.Row(headerRow).Height = 26;

        // Data Rows
        var currentRow = headerRow + 1;
        var rowIndex = 1;

        foreach (var lead in leads)
        {
            var trTime = lead.CreatedAt.ToTurkeyTime();
            var isWhatsApp = string.Equals(lead.ConversionType, LeadConversionTypes.WhatsAppClick, StringComparison.OrdinalIgnoreCase);
            var isBusinessHour = trTime.Hour >= 9 && trTime.Hour < 19;

            var typeLabel = isWhatsApp
                ? "WhatsApp Tıklaması"
                : string.Equals(lead.ConversionType, LeadConversionTypes.PhoneClick, StringComparison.OrdinalIgnoreCase)
                    ? "Telefon Araması"
                    : lead.ConversionType;

            var pageSlug = string.IsNullOrWhiteSpace(lead.SourcePageSlug) || lead.SourcePageSlug.Trim() == "/"
                ? "Ana Sayfa (/)"
                : lead.SourcePageSlug.Trim();

            var sourceMedium = string.IsNullOrWhiteSpace(lead.UtmSource) && string.IsNullOrWhiteSpace(lead.UtmMedium)
                ? "Doğrudan / Organik"
                : $"{lead.UtmSource ?? "-"} / {lead.UtmMedium ?? "-"}";

            var campaign = string.IsNullOrWhiteSpace(lead.UtmCampaign)
                ? "Organik / Doğrudan Ziyaret"
                : lead.UtmCampaign.Trim();

            var isZebra = rowIndex % 2 == 0;
            var baseRowBg = isZebra ? XLColor.FromHtml("#F8FAFC") : XLColor.White;

            wsLeads.Cell(currentRow, 1).Value = rowIndex;
            wsLeads.Cell(currentRow, 1).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            wsLeads.Cell(currentRow, 2).Value = trTime.ToString("dd.MM.yyyy HH:mm:ss");
            wsLeads.Cell(currentRow, 3).Value = typeLabel;
            wsLeads.Cell(currentRow, 4).Value = isBusinessHour ? "Mesai İçi (09:00-19:00)" : "Mesai Dışı";
            wsLeads.Cell(currentRow, 5).Value = pageSlug;
            wsLeads.Cell(currentRow, 6).Value = sourceMedium;
            wsLeads.Cell(currentRow, 7).Value = campaign;

            var rowRange = wsLeads.Range(currentRow, 1, currentRow, 7);
            rowRange.Style
                .Font.SetFontSize(10)
                .Font.SetFontColor(XLColor.FromHtml("#1E293B"))
                .Fill.SetBackgroundColor(baseRowBg)
                .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetOutsideBorderColor(XLColor.FromHtml("#E2E8F0"))
                .Border.SetInsideBorder(XLBorderStyleValues.Thin)
                .Border.SetInsideBorderColor(XLColor.FromHtml("#E2E8F0"));

            // Color-coded Channel Badge Cell (Col 3)
            var channelCell = wsLeads.Cell(currentRow, 3);
            channelCell.Style.Font.SetBold(true);
            if (isWhatsApp)
            {
                channelCell.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#D1FAE5"));
                channelCell.Style.Font.SetFontColor(XLColor.FromHtml("#065F46"));
            }
            else
            {
                channelCell.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#E0E7FF"));
                channelCell.Style.Font.SetFontColor(XLColor.FromHtml("#3730A3"));
            }

            // Color-coded Business Hours Cell (Col 4)
            var shiftCell = wsLeads.Cell(currentRow, 4);
            shiftCell.Style.Font.SetBold(true);
            if (isBusinessHour)
            {
                shiftCell.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#ECFDF5"));
                shiftCell.Style.Font.SetFontColor(XLColor.FromHtml("#047857"));
            }
            else
            {
                shiftCell.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#FEF3C7"));
                shiftCell.Style.Font.SetFontColor(XLColor.FromHtml("#92400E"));
            }

            // Highlight Paid UTM Campaigns (Col 7)
            var campaignCell = wsLeads.Cell(currentRow, 7);
            if (!string.IsNullOrWhiteSpace(lead.UtmCampaign))
            {
                campaignCell.Style.Font.SetBold(true);
                campaignCell.Style.Font.SetFontColor(XLColor.FromHtml("#4338CA"));
                campaignCell.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#EEF2FF"));
            }

            wsLeads.Row(currentRow).Height = 21;
            currentRow++;
            rowIndex++;
        }

        if (leads.Count > 0)
        {
            wsLeads.Range(headerRow, 1, currentRow - 1, 7).SetAutoFilter();
        }

        wsLeads.SheetView.FreezeRows(headerRow);
        wsLeads.Column(1).Width = 7;
        wsLeads.Column(2).Width = 22;
        wsLeads.Column(3).Width = 22;
        wsLeads.Column(4).Width = 24;
        wsLeads.Column(5).Width = 30;
        wsLeads.Column(6).Width = 24;
        wsLeads.Column(7).Width = 30;

        // =========================================================================
        // SHEET 2: 30 Günlük & Kampanya Özeti (Daily Trend, Campaigns & Pages)
        // =========================================================================
        var wsSummary = workbook.Worksheets.Add("30 Günlük & Kampanya Özeti");
        wsSummary.ShowGridLines = true;

        wsSummary.Range("A1:K1").Merge();
        wsSummary.Cell("A1").Value = $"GÜNLÜK ETKİLEŞİM TRENDİ, GOOGLE ADS KAMPANYA VE SAYFA PERFORMANSI ({rangeLabel.ToUpperInvariant()})";
        wsSummary.Range("A1:K1").Style
            .Font.SetBold(true)
            .Font.SetFontSize(12)
            .Font.SetFontColor(XLColor.White)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#0F172A"))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        wsSummary.Row(1).Height = 30;

        // Left Table: Daily Trend (Cols A-E)
        var dailyHeaders = new[] { "Tarih", "Gün Etiketi", "WhatsApp", "Telefon", "Toplam Etkileşim" };
        for (var c = 0; c < dailyHeaders.Length; c++)
        {
            var cell = wsSummary.Cell(3, c + 1);
            cell.Value = dailyHeaders[c];
            cell.Style
                .Font.SetBold(true)
                .Font.SetFontColor(XLColor.White)
                .Fill.SetBackgroundColor(XLColor.FromHtml("#047857"))
                .Alignment.SetHorizontal(c >= 2 ? XLAlignmentHorizontalValues.Center : XLAlignmentHorizontalValues.Left)
                .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        }
        wsSummary.Row(3).Height = 24;

        var dRow = 4;
        foreach (var pt in dailyTrend.OrderByDescending(x => x.Date))
        {
            wsSummary.Cell(dRow, 1).Value = pt.Date;
            wsSummary.Cell(dRow, 2).Value = pt.Label;
            wsSummary.Cell(dRow, 3).Value = pt.WhatsApp;
            wsSummary.Cell(dRow, 4).Value = pt.Phone;
            wsSummary.Cell(dRow, 5).Value = pt.Total;

            var rRange = wsSummary.Range(dRow, 1, dRow, 5);
            rRange.Style
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetOutsideBorderColor(XLColor.FromHtml("#E2E8F0"))
                .Border.SetInsideBorder(XLBorderStyleValues.Thin)
                .Border.SetInsideBorderColor(XLColor.FromHtml("#E2E8F0"));

            wsSummary.Range(dRow, 3, dRow, 5).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            if (pt.Total > 0)
            {
                rRange.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#ECFDF5"));
                wsSummary.Cell(dRow, 5).Style.Font.SetBold(true).Font.SetFontColor(XLColor.FromHtml("#065F46"));
            }
            dRow++;
        }

        // Right Table 1: By Campaign (Cols G-H)
        wsSummary.Cell(3, 7).Value = "Google Ads Kampanyası (UTM)";
        wsSummary.Cell(3, 8).Value = "Dönüşüm Sayısı";
        wsSummary.Range(3, 7, 3, 8).Style
            .Font.SetBold(true)
            .Font.SetFontColor(XLColor.White)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#3730A3"))
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        wsSummary.Cell(3, 8).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

        var cRow = 4;
        foreach (var camp in byCampaign)
        {
            wsSummary.Cell(cRow, 7).Value = camp.Campaign;
            wsSummary.Cell(cRow, 8).Value = camp.Count;
            wsSummary.Cell(cRow, 8).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center).Font.SetBold(true);
            wsSummary.Range(cRow, 7, cRow, 8).Style
                .Fill.SetBackgroundColor(XLColor.FromHtml("#EEF2FF"))
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetOutsideBorderColor(XLColor.FromHtml("#C7D2FE"))
                .Border.SetInsideBorder(XLBorderStyleValues.Thin)
                .Border.SetInsideBorderColor(XLColor.FromHtml("#C7D2FE"));
            cRow++;
        }

        // Right Table 2: By Landing Page (Cols J-K)
        wsSummary.Cell(3, 10).Value = "En Çok Dönüşüm Getiren Sayfa";
        wsSummary.Cell(3, 11).Value = "Tıklama Sayısı";
        wsSummary.Range(3, 10, 3, 11).Style
            .Font.SetBold(true)
            .Font.SetFontColor(XLColor.White)
            .Fill.SetBackgroundColor(XLColor.FromHtml("#B45309"))
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);
        wsSummary.Cell(3, 11).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

        var pRow = 4;
        foreach (var pg in byPage)
        {
            var label = pg.PageSlug == "/" ? "Ana Sayfa (/)" : pg.PageSlug;
            wsSummary.Cell(pRow, 10).Value = label;
            wsSummary.Cell(pRow, 11).Value = pg.Count;
            wsSummary.Cell(pRow, 11).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center).Font.SetBold(true);
            wsSummary.Range(pRow, 10, pRow, 11).Style
                .Fill.SetBackgroundColor(XLColor.FromHtml("#FFFBEB"))
                .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
                .Border.SetOutsideBorderColor(XLColor.FromHtml("#FDE68A"))
                .Border.SetInsideBorder(XLBorderStyleValues.Thin)
                .Border.SetInsideBorderColor(XLColor.FromHtml("#FDE68A"));
            pRow++;
        }

        wsSummary.Column(1).Width = 18;
        wsSummary.Column(2).Width = 16;
        wsSummary.Column(3).Width = 14;
        wsSummary.Column(4).Width = 14;
        wsSummary.Column(5).Width = 18;
        wsSummary.Column(6).Width = 4;
        wsSummary.Column(7).Width = 32;
        wsSummary.Column(8).Width = 18;
        wsSummary.Column(9).Width = 4;
        wsSummary.Column(10).Width = 32;
        wsSummary.Column(11).Width = 18;

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return Result<byte[]>.Success(ms.ToArray());
    }

    private static void StyleKpiBlock(
        IXLWorksheet ws,
        string titleRangeAddr,
        string valueRangeAddr,
        string title,
        string value,
        string headerHex,
        string bodyHex,
        string textHex)
    {
        var titleRange = ws.Range(titleRangeAddr);
        titleRange.Merge();
        titleRange.FirstCell().Value = title;
        titleRange.Style
            .Font.SetBold(true)
            .Font.SetFontSize(8.5)
            .Font.SetFontColor(XLColor.White)
            .Fill.SetBackgroundColor(XLColor.FromHtml(headerHex))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center);

        var valueRange = ws.Range(valueRangeAddr);
        valueRange.Merge();
        valueRange.FirstCell().Value = value;
        valueRange.Style
            .Font.SetBold(true)
            .Font.SetFontSize(11)
            .Font.SetFontColor(XLColor.FromHtml(textHex))
            .Fill.SetBackgroundColor(XLColor.FromHtml(bodyHex))
            .Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center)
            .Alignment.SetVertical(XLAlignmentVerticalValues.Center)
            .Border.SetOutsideBorder(XLBorderStyleValues.Thin)
            .Border.SetOutsideBorderColor(XLColor.FromHtml(headerHex));
    }
}
