using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class MajorRepository(FutureConnectionDbContext context) : GenericRepository<Major>(context), IMajorRepository { }
