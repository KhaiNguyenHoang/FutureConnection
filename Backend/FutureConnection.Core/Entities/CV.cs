namespace FutureConnection.Core.Entities
{
    public class CV : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User User { get; set; } = null!;
        public string? University { get; set; }
        public virtual ICollection<Major> Majors { get; set; } = [];
        public virtual ICollection<Certificate> Certificates { get; set; } = [];
        public virtual ICollection<Framework> Frameworks { get; set; } = [];
        public virtual ICollection<PersonalProject> PersonalProjects { get; set; } = [];
    }
}
