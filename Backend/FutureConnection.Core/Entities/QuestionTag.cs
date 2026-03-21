namespace FutureConnection.Core.Entities
{
    public class QuestionTag : BaseEntity
    {
        public Guid QuestionId { get; set; }
        public virtual Question Question { get; set; } = null!;

        public Guid TagId { get; set; }
        public virtual Tag Tag { get; set; } = null!;
    }
}
