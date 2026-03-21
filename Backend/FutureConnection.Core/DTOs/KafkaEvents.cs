namespace FutureConnection.Core.DTOs
{
    /// <summary>
    /// Published by IdentityService when a new user successfully registers.
    /// Consumed by ProfileService to auto-create an empty profile.
    /// </summary>
    public class UserCreatedEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime RegisteredAt { get; set; }
    }

    /// <summary>
    /// Published by JobService when a candidate applies to a job.
    /// Consumed by ChatService/NotificationService to message the employer.
    /// </summary>
    public class JobApplicationSubmittedEvent
    {
        public Guid ApplicationId { get; set; }
        public Guid JobId { get; set; }
        public Guid ApplicantId { get; set; }
        public Guid EmployerId { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
    }

    /// <summary>
    /// Published by ChatService when a user sends a message.
    /// Could be consumed by a notification push service in the future.
    /// </summary>
    public class MessageSentEvent
    {
        public Guid MessageId { get; set; }
        public Guid SenderId { get; set; }
        public Guid? ReceiverId { get; set; }
        public Guid? GroupId { get; set; }
        public Guid? ChannelId { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
