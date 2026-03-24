namespace FutureConnection.Core.Entities
{
    public class UserFramework : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public Guid FrameworkId { get; set; }
        public virtual Framework Framework { get; set; } = null!;
    }
}
