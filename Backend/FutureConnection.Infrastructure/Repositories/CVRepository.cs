using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class CVRepository(FutureConnectionDbContext context) : GenericRepository<CV>(context), ICVRepository { }
