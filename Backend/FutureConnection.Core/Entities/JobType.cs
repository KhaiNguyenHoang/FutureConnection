namespace FutureConnection.Core.Entities
{
    public class JobType : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }

        public virtual ICollection<Job> Jobs { get; set; } = [];
    }
}
