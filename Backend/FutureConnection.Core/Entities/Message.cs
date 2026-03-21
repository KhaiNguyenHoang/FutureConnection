namespace FutureConnection.Core.Entities
{
    public class Message : BaseEntity
    {
        public required string Content { get; set; }

        public Guid SenderId { get; set; }
        public virtual User Sender { get; set; } = null!;

        public Guid? ReceiverId { get; set; }
        public virtual User? Receiver { get; set; }

        public Guid? GroupId { get; set; }
        public virtual Group? Group { get; set; }

        public Guid? ChannelId { get; set; }
        public virtual Channel? Channel { get; set; }
    }
}
