using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class CertificateRepository(FutureConnectionDbContext context) : GenericRepository<Certificate>(context), ICertificateRepository { }
