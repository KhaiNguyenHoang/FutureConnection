using FutureConnection.Core.Entities;
using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Repositories;

public class MessageRepository(FutureConnectionDbContext context) : GenericRepository<Message>(context), IMessageRepository
{
    public async Task<IEnumerable<Message>> GetConversationMessagesAsync(Guid senderId, Guid receiverId) =>
        await _context.Messages
            .Where(m => (m.SenderId == senderId && m.ReceiverId == receiverId) || (m.SenderId == receiverId && m.ReceiverId == senderId))
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
}
