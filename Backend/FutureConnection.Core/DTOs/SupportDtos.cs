using System;
using FutureConnection.Core.Entities;
using FutureConnection.Core.Enums;

namespace FutureConnection.Core.DTOs
{
    public class CreateTicketDto
    {
        public required string Subject { get; set; }
        public required string Description { get; set; }
        public required string Area { get; set; }
        public TicketUrgency Urgency { get; set; }
    }

    public class TicketResponseDto
    {
        public Guid Id { get; set; }
        public required string Subject { get; set; }
        public required string Description { get; set; }
        public required string Area { get; set; }
        public TicketStatus Status { get; set; }
        public TicketUrgency Urgency { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class PolicyResponseDto
    {
        public required string Title { get; set; }
        public required string Type { get; set; }
        public required string Content { get; set; }
        public required string Version { get; set; }
    }

    public class FAQResponseDto
    {
        public required string Question { get; set; }
        public required string Answer { get; set; }
        public required string Category { get; set; }
        public int DisplayOrder { get; set; }
    }
}
