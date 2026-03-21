using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;

namespace FutureConnection.Infrastructure.Repositories;

public class TransactionRepository(FutureConnectionDbContext context) : GenericRepository<Transaction>(context), ITransactionRepository { }
