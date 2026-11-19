using Clinic.Domain.Entities;

namespace Clinic.Application.Common.Interfaces;

public record LeadNameCount(string Name, int Count);
public record LeadDailyTypeCount(string Date, string ConversionType, int Count);
public record LeadHourlyTypeCount(int Hour, string ConversionType, int Count);

public record LeadSummaryAggregation(
    int WhatsAppClicks,
    int PhoneClicks,
    List<LeadNameCount> ByCampaign,
    List<LeadNameCount> ByPage,
    List<LeadDailyTypeCount> DailyByType,
    List<LeadHourlyTypeCount> HourlyByType
);

public interface ILeadRepository
{
    Task<List<Lead>> GetFilteredAsync(
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        string? conversionType = null,
        CancellationToken cancellationToken = default);

    Task<LeadSummaryAggregation> GetSummaryAggregationAsync(
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        bool includeBreakdowns = true,
        CancellationToken cancellationToken = default);

    Task<(List<Lead> Items, int TotalCount)> GetPagedAsync(
        DateTime? fromUtc = null,
        string? conversionType = null,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        CancellationToken cancellationToken = default);

    Task CreateAsync(Lead lead, CancellationToken cancellationToken = default);
}
