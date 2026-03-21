namespace FutureConnection.Core.Entities
{
    public class Tag : BaseEntity
    {
        public required string Name { get; set; }
        public virtual ICollection<PostTag> PostTags { get; set; } = [];
        public virtual ICollection<JobTag> JobTags { get; set; } = [];
        public virtual ICollection<QuestionTag> QuestionTags { get; set; } = [];
    }
}
