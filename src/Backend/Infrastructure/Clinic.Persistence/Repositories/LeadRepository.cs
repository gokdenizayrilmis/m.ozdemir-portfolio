using Clinic.Application.Common.Interfaces;
using Clinic.Domain.Entities;
using Clinic.Persistence.Context;
using MongoDB.Driver;

namespace Clinic.Persistence.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly MongoDbContext _context;

    public LeadRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Lead>> GetAllAsync(bool? isRead = null, CancellationToken cancellationToken = default)
    {
        var builder = Builders<Lead>.Filter;
        var filter = builder.Eq(x => x.IsDeleted, false);

        if (isRead.HasValue)
        {
            filter &= builder.Eq(x => x.IsRead, isRead.Value);
        }

        return await _context.Leads
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Lead?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        return await _context.Leads
            .Find(x => x.Id == id && !x.IsDeleted)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task CreateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        await _context.Leads.InsertOneAsync(lead, cancellationToken: cancellationToken);
    }

    public async Task UpdateAsync(Lead lead, CancellationToken cancellationToken = default)
    {
        await _context.Leads.ReplaceOneAsync(
            x => x.Id == lead.Id,
            lead,
            cancellationToken: cancellationToken);
    }
}

