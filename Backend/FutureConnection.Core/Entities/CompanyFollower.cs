namespace FutureConnection.Core.Entities
{
    public class CompanyFollower : BaseEntity
    {
        public Guid CompanyId { get; set; }
        public virtual Company Company { get; set; } = null!;

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
    }
}
