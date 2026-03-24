namespace FutureConnection.Core.Entities
{
    public class UserLanguage : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public Guid CodeLanguageId { get; set; }
        public virtual CodeLanguage CodeLanguage { get; set; } = null!;
    }
}
