namespace FutureConnection.Core.Entities
{
    public class Question : BaseEntity
    {
        public required string Title { get; set; }
        public required string Content { get; set; }
        public int ViewCount { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public virtual ICollection<Answer> Answers { get; set; } = [];
        public virtual ICollection<Vote> Votes { get; set; } = [];

        // Tags can reuse the existing Tag entity. Need a Join table QuestionTag.
        public virtual ICollection<QuestionTag> QuestionTags { get; set; } = [];
    }
}
