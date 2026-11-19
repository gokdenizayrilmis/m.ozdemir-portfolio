using System.Text;
using Clinic.Application.Common.Interfaces;
using Clinic.Application.Common.Models;
using Clinic.Domain.Entities;
using MediatR;

namespace Clinic.Application.Features.Leads;

public record CampaignClickStatDto(string Campaign, int Count);

public record PageClickStatDto(string PageSlug, int Count);

public record LeadsSummaryDto(
    int TotalClicks,
    int WhatsAppClicks,
    int PhoneClicks,
    List<CampaignClickStatDto> ByCampaign,
    List<PageClickStatDto> ByPage
);

public record PagedLeadsResponse(
    List<Lead> Items,
    int TotalCount,
    int Page,
    int PageSize
);

public static class LeadRangeHelper
{
    public static DateTime? ParseRangeToUtc(string? range)
    {
        var normalized = (range ?? "30d").Trim().ToLowerInvariant();
        var trNow = DateTime.UtcNow.AddHours(3);

        return normalized switch
        {
            "today" => new DateTime(trNow.Year, trNow.Month, trNow.Day, 0, 0, 0, DateTimeKind.Utc).AddHours(-3),
            "7d" => DateTime.UtcNow.AddDays(-7),
            "30d" => DateTime.UtcNow.AddDays(-30),
            "month" => new DateTime(trNow.Year, trNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddHours(-3),
            "all" => null,
            _ => DateTime.UtcNow.AddDays(-30)
        };
    }
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
            ? "WhatsAppClick"
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
        var leads = await _repository.GetFilteredAsync(fromUtc, null, cancellationToken);

        var totalClicks = leads.Count;
        var whatsAppClicks = leads.Count(x => string.Equals(x.ConversionType, "WhatsAppClick", StringComparison.OrdinalIgnoreCase));
        var phoneClicks = leads.Count(x => string.Equals(x.ConversionType, "PhoneClick", StringComparison.OrdinalIgnoreCase));

        var byCampaign = leads
            .GroupBy(x => string.IsNullOrWhiteSpace(x.UtmCampaign) ? "Organik / Doğrudan Ziyaret" : x.UtmCampaign!)
            .Select(g => new CampaignClickStatDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var byPage = leads
            .GroupBy(x => string.IsNullOrWhiteSpace(x.SourcePageSlug) ? "/" : x.SourcePageSlug)
            .Select(g => new PageClickStatDto(g.Key, g.Count()))
            .OrderByDescending(x => x.Count)
            .ToList();

        var summary = new LeadsSummaryDto(
            totalClicks,
            whatsAppClicks,
            phoneClicks,
            byCampaign,
            byPage);

        return Result<LeadsSummaryDto>.Success(summary);
    }
}

// 3. GetPagedLeadsQuery
public record GetPagedLeadsQuery(
    string Range = "all",
    string? Type = null,
    int Page = 1,
    int PageSize = 25
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
        var safePageSize = request.PageSize < 1 ? 25 : (request.PageSize > 200 ? 200 : request.PageSize);
        var fromUtc = LeadRangeHelper.ParseRangeToUtc(request.Range);

        var (items, totalCount) = await _repository.GetPagedAsync(
            fromUtc,
            request.Type,
            safePage,
            safePageSize,
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
        var leads = await _repository.GetFilteredAsync(fromUtc, request.Type, cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Tarih (TR),Dönüşüm Tipi,Kaynak Sayfa,UTM Source,UTM Medium,UTM Campaign");

        foreach (var lead in leads)
        {
            var trTime = lead.CreatedAt.AddHours(3).ToString("yyyy-MM-dd HH:mm:ss");
            var typeLabel = lead.ConversionType == "WhatsAppClick"
                ? "WhatsApp Tıklaması"
                : lead.ConversionType == "PhoneClick"
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
