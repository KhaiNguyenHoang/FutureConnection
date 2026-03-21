namespace FutureConnection.Core.Entities
{
    public class Endorsement : BaseEntity
    {
        public Guid EndorserId { get; set; }
        public virtual User Endorser { get; set; } = null!;

        public Guid EndorseeId { get; set; }
        public virtual User Endorsee { get; set; } = null!;

        public Guid SkillTagId { get; set; }
        public virtual Tag SkillTag { get; set; } = null!;
    }
}
