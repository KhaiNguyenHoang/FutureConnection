namespace FutureConnection.Core.Entities
{
    public class Answer : BaseEntity
    {
        public required string Content { get; set; }
        public bool IsAccepted { get; set; }

        public Guid QuestionId { get; set; }
        public virtual Question Question { get; set; } = null!;

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public virtual ICollection<Vote> Votes { get; set; } = [];
        public virtual ICollection<AnswerMedia> Media { get; set; } = [];
    }
}
