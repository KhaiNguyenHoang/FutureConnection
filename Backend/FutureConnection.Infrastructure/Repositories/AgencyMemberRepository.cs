using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class AgencyMemberRepository(FutureConnectionDbContext context) : GenericRepository<AgencyMember>(context), IAgencyMemberRepository { }
