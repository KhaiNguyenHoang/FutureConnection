using FutureConnection.Core.Enums;
using System;

namespace FutureConnection.Core.Entities
{
    public class SupportTicket : BaseEntity
    {
        public Guid UserId { get; set; }
        public required string Subject { get; set; }
        public required string Description { get; set; }
        public required string Area { get; set; } // e.g., Technical, Billing
        public TicketStatus Status { get; set; } = TicketStatus.Open;
        public TicketUrgency Urgency { get; set; } = TicketUrgency.Standard;
        
        public virtual required User User { get; set; }
    }
}
