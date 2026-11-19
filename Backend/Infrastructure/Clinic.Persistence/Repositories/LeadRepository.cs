using System.Text.RegularExpressions;
using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Constants;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class LeadRepository : ILeadRepository
{
    private static readonly string[] ValidClickTypes =
    {
        LeadConversionTypes.WhatsAppClick,
        LeadConversionTypes.PhoneClick
    };

    private readonly MongoDbContext _context;

    public LeadRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lead>> GetFilteredAsync(
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        string? conversionType = null,
        CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(fromUtc, toUtc, conversionType, null);
        return await _context.Leads
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<LeadSummaryAggregation> GetSummaryAggregationAsync(
        DateTime? fromUtc = null,
        DateTime? toUtc = null,
        bool includeBreakdowns = true,
        CancellationToken cancellationToken = default)
    {
        var filter = BuildFilter(fromUtc, toUtc, null, null);
        var renderedMatch = filter.Render(new RenderArgs<Lead>(
            _context.Leads.DocumentSerializer,
            _context.Leads.Settings.SerializerRegistry));

        var facets = new BsonDocument
        {
            {
                "typeCounts",
                new BsonArray
                {
                    new BsonDocument("$group", new BsonDocument
                    {
                        { "_id", "$ConversionType" },
                        { "count", new BsonDocument("$sum", 1) }
                    })
                }
            }
        };

        if (includeBreakdowns)
        {
            facets.Add("byCampaign", new BsonArray
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument("$ifNull", new BsonArray { "$UtmCampaign", "" }) },
                    { "count", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("count", -1))
            });

            facets.Add("byPage", new BsonArray
            {
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", new BsonDocument("$ifNull", new BsonArray { "$SourcePageSlug", "/" }) },
                    { "count", new BsonDocument("$sum", 1) }
                }),
                new BsonDocument("$sort", new BsonDocument("count", -1))
            });

            facets.Add("dailyByType", new BsonArray
            {
                new BsonDocument("$group", new BsonDocument
                {
                    {
                        "_id",
                        new BsonDocument
                        {
                            {
                                "date",
                                new BsonDocument("$dateToString", new BsonDocument
                                {
                                    { "format", "%Y-%m-%d" },
                                    { "date", "$CreatedAt" },
                                    { "timezone", "+03:00" }
                                })
                            },
                            { "conversionType", "$ConversionType" }
                        }
                    },
                    { "count", new BsonDocument("$sum", 1) }
                })
            });

            facets.Add("hourlyByType", new BsonArray
            {
                new BsonDocument("$group", new BsonDocument
                {
                    {
                        "_id",
                        new BsonDocument
                        {
                            {
                                "hour",
                                new BsonDocument("$hour", new BsonDocument
                                {
                                    { "date", "$CreatedAt" },
                                    { "timezone", "+03:00" }
                                })
                            },
                            { "conversionType", "$ConversionType" }
                        }
                    },
                    { "count", new BsonDocument("$sum", 1) }
                })
            });
        }

        var pipeline = PipelineDefinition<Lead, BsonDocument>.Create(new[]
        {
            new BsonDocument("$match", renderedMatch),
            new BsonDocument("$facet", facets)
        });

        var resultDoc = await _context.Leads
            .Aggregate(pipeline, cancellationToken: cancellationToken)
            .FirstOrDefaultAsync(cancellationToken);

        if (resultDoc is null)
        {
            return new LeadSummaryAggregation(
                0,
                0,
                new List<LeadNameCount>(),
                new List<LeadNameCount>(),
                new List<LeadDailyTypeCount>(),
                new List<LeadHourlyTypeCount>());
        }

        var whatsAppClicks = 0;
        var phoneClicks = 0;
        if (resultDoc.TryGetValue("typeCounts", out var typeCountsVal) && typeCountsVal.IsBsonArray)
        {
            foreach (var item in typeCountsVal.AsBsonArray)
            {
                var doc = item.AsBsonDocument;
                var type = doc.GetValue("_id", BsonNull.Value).IsString ? doc["_id"].AsString : string.Empty;
                var count = doc.GetValue("count", 0).ToInt32();

                if (string.Equals(type, LeadConversionTypes.WhatsAppClick, StringComparison.OrdinalIgnoreCase))
                    whatsAppClicks += count;
                else if (string.Equals(type, LeadConversionTypes.PhoneClick, StringComparison.OrdinalIgnoreCase))
                    phoneClicks += count;
            }
        }

        var byCampaign = new List<LeadNameCount>();
        if (resultDoc.TryGetValue("byCampaign", out var campaignVal) && campaignVal.IsBsonArray)
        {
            foreach (var item in campaignVal.AsBsonArray)
            {
                var doc = item.AsBsonDocument;
                var name = doc.GetValue("_id", BsonNull.Value).IsString ? doc["_id"].AsString : string.Empty;
                var count = doc.GetValue("count", 0).ToInt32();
                byCampaign.Add(new LeadNameCount(name, count));
            }
        }

        var byPage = new List<LeadNameCount>();
        if (resultDoc.TryGetValue("byPage", out var pageVal) && pageVal.IsBsonArray)
        {
            foreach (var item in pageVal.AsBsonArray)
            {
                var doc = item.AsBsonDocument;
                var name = doc.GetValue("_id", BsonNull.Value).IsString ? doc["_id"].AsString : "/";
                var count = doc.GetValue("count", 0).ToInt32();
                byPage.Add(new LeadNameCount(name, count));
            }
        }

        var dailyByType = new List<LeadDailyTypeCount>();
        if (resultDoc.TryGetValue("dailyByType", out var dailyVal) && dailyVal.IsBsonArray)
        {
            foreach (var item in dailyVal.AsBsonArray)
            {
                var doc = item.AsBsonDocument;
                var idDoc = doc["_id"].AsBsonDocument;
                var date = idDoc.GetValue("date", string.Empty).AsString;
                var type = idDoc.GetValue("conversionType", string.Empty).AsString;
                var count = doc.GetValue("count", 0).ToInt32();
                dailyByType.Add(new LeadDailyTypeCount(date, type, count));
            }
        }

        var hourlyByType = new List<LeadHourlyTypeCount>();
        if (resultDoc.TryGetValue("hourlyByType", out var hourlyVal) && hourlyVal.IsBsonArray)
        {
            foreach (var item in hourlyVal.AsBsonArray)
            {
                var doc = item.AsBsonDocument;
                var idDoc = doc["_id"].AsBsonDocument;
                var hour = idDoc.GetValue("hour", 0).ToInt32();
                var type = idDoc.GetValue("conversionType", string.Empty).AsString;
                var count = doc.GetValue("count", 0).ToInt32();
                hourlyByType.Add(new LeadHourlyTypeCount(hour, type, count));
            }
        }

        return new LeadSummaryAggregation(
            whatsAppClicks,
            phoneClicks,
            byCampaign,
            byPage,
            dailyByType,
            hourlyByType);
    }

    public async Task<(List<Lead> Items, int TotalCount)> GetPagedAsync(
        DateTime? fromUtc = null,
        string? conversionType = null,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var safePage = page < 1 ? 1 : page;
        var safePageSize = pageSize < 1 ? 10 : (pageSize > 200 ? 200 : pageSize);
        var filter = BuildFilter(fromUtc, null, conversionType, search);

        var totalCount = (int)await _context.Leads.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
        var items = await _context.Leads
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Limit(safePageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task CreateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        await _context.Leads.InsertOneAsync(lead, cancellationToken: cancellationToken);
    }

    private static FilterDefinition<Lead> BuildFilter(
        DateTime? fromUtc,
        DateTime? toUtc,
        string? conversionType,
        string? search)
    {
        var builder = Builders<Lead>.Filter;
        var filter = builder.Eq(x => x.IsDeleted, false);

        if (fromUtc.HasValue)
        {
            filter &= builder.Gte(x => x.CreatedAt, fromUtc.Value);
        }

        if (toUtc.HasValue)
        {
            filter &= builder.Lt(x => x.CreatedAt, toUtc.Value);
        }

        if (!string.IsNullOrWhiteSpace(conversionType) &&
            !string.Equals(conversionType, "all", StringComparison.OrdinalIgnoreCase))
        {
            filter &= builder.Eq(x => x.ConversionType, conversionType.Trim());
        }
        else
        {
            // Exclude any legacy ContactForm records so totalClicks == whatsAppClicks + phoneClicks
            filter &= builder.In(x => x.ConversionType, ValidClickTypes);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            var escaped = Regex.Escape(term);
            var regex = new BsonRegularExpression(escaped, "i");

            var searchFilters = new List<FilterDefinition<Lead>>
            {
                builder.Regex(x => x.SourcePageSlug, regex),
                builder.Regex(x => x.UtmCampaign, regex),
                builder.Regex(x => x.UtmSource, regex)
            };

            var lowerTerm = term.ToLowerInvariant();
            if ("organik / doğrudan ziyaret".Contains(lowerTerm) ||
                "organik / dogrudan ziyaret".Contains(lowerTerm))
            {
                searchFilters.Add(builder.Eq(x => x.UtmCampaign, null));
                searchFilters.Add(builder.Eq(x => x.UtmCampaign, string.Empty));
            }

            if ("ana sayfa (/)".Contains(lowerTerm) || term == "/")
            {
                searchFilters.Add(builder.Eq(x => x.SourcePageSlug, "/"));
            }

            filter &= builder.Or(searchFilters);
        }

        return filter;
    }
}
