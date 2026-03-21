namespace FutureConnection.Core.Entities
{
    public class PostTag : BaseEntity
    {
        public Guid PostId { get; set; }
        public virtual Post Post { get; set; } = null!;

        public Guid TagId { get; set; }
        public virtual Tag Tag { get; set; } = null!;
    }
}
