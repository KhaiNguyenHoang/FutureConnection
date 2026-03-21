namespace FutureConnection.Core.Entities
{
    public class Agency : BaseEntity
    {
        public required string Name { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? Location { get; set; }
        public string? WebsiteUrl { get; set; }

        public Guid OwnerId { get; set; }
        public virtual User Owner { get; set; } = null!;

        public virtual ICollection<AgencyMember> Members { get; set; } = [];
        public virtual ICollection<Application> Proposals { get; set; } = [];
        public virtual ICollection<Contract> Contracts { get; set; } = [];
    }
}
