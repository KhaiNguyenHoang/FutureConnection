using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class PersonalProjectRepository(FutureConnectionDbContext context) : GenericRepository<PersonalProject>(context), IPersonalProjectRepository { }
