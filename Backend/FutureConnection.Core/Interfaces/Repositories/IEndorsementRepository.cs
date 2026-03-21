using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Interfaces.Repositories;

public interface IEndorsementRepository : IGenericRepository<Endorsement>
{
    Task<IEnumerable<Endorsement>> GetReceivedEndorsementsAsync(Guid userId);
}
