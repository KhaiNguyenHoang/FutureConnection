using FutureConnection.Core.Enums;

namespace FutureConnection.Core.Entities
{
    public class Vote : BaseEntity
    {
        public VoteType Type { get; set; }

        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;

        public Guid? QuestionId { get; set; }
        public virtual Question? Question { get; set; }

        public Guid? AnswerId { get; set; }
        public virtual Answer? Answer { get; set; }
    }
}
