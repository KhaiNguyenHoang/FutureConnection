using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Badge : BaseEntity
    {
        public required string Name { get; set; }
        public required string Description { get; set; }
        public string? ImageUrl { get; set; }
        public BadgeLevel Level { get; set; } = BadgeLevel.Bronze;

        public virtual ICollection<UserBadge> UserBadges { get; set; } = [];
    }
}
