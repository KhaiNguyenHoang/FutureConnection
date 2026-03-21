using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class FrameworkTypeRepository(FutureConnectionDbContext context) : GenericRepository<FrameworkType>(context), IFrameworkTypeRepository { }
