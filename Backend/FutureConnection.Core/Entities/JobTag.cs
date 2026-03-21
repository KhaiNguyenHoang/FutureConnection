namespace FutureConnection.Core.Entities
{
    public class JobTag : BaseEntity
    {
        public Guid JobId { get; set; }
        public virtual Job Job { get; set; } = null!;

        public Guid TagId { get; set; }
        public virtual Tag Tag { get; set; } = null!;
    }
}
