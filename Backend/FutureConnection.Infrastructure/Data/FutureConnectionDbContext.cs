using FutureConnection.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace FutureConnection.Infrastructure.Data
{
    public class FutureConnectionDbContext(DbContextOptions<FutureConnectionDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<SocialMedia> SocialMediaLinks { get; set; }
        public DbSet<CV> CVs { get; set; }
        public DbSet<Major> Majors { get; set; }
        public DbSet<Certificate> Certificates { get; set; }
        public DbSet<PersonalProject> PersonalProjects { get; set; }
        public DbSet<ProjectRole> ProjectRoles { get; set; }
        public DbSet<Framework> Frameworks { get; set; }
        public DbSet<FrameworkType> FrameworkTypes { get; set; }
        public DbSet<CodeLanguage> CodeLanguages { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<PostMedia> PostMedia { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<CommentMedia> CommentMedia { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<JobType> JobTypes { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<JobTag> JobTags { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<BlacklistedToken> BlacklistedTokens { get; set; }
        public DbSet<Connection> Connections { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<CompanyFollower> CompanyFollowers { get; set; }
        public DbSet<Endorsement> Endorsements { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionTag> QuestionTags { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Vote> Votes { get; set; }
        public DbSet<Reputation> Reputations { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        public DbSet<Bounty> Bounties { get; set; }
        public DbSet<Agency> Agencies { get; set; }
        public DbSet<AgencyMember> AgencyMembers { get; set; }
        public DbSet<ContractMilestone> ContractMilestones { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Dispute> Disputes { get; set; }
        public DbSet<Channel> Channels { get; set; }
        public DbSet<OpenSourceContribution> OpenSourceContributions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<PostTag>()
                .HasKey(static pt => new { pt.PostId, pt.TagId });

            modelBuilder.Entity<PostTag>()
                .HasOne(static pt => pt.Post)
                .WithMany(static p => p.PostTags)
                .HasForeignKey(static pt => pt.PostId);

            modelBuilder.Entity<PostTag>()
                .HasOne(static pt => pt.Tag)
                .WithMany(static t => t.PostTags)
                .HasForeignKey(static pt => pt.TagId);

            modelBuilder.Entity<JobTag>()
                .HasKey(static jt => new { jt.JobId, jt.TagId });

            modelBuilder.Entity<Application>()
                .HasOne(static a => a.Applicant)
                .WithMany(static u => u.Applications)
                .HasForeignKey(static a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Application>()
                .HasOne(static a => a.Job)
                .WithMany(static j => j.Applications)
                .HasForeignKey(static a => a.JobId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(static c => c.Employer)
                .WithMany(static u => u.EmployerContracts)
                .HasForeignKey(static c => c.EmployerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(static c => c.Freelancer)
                .WithMany(static u => u.FreelancerContracts)
                .HasForeignKey(static c => c.FreelancerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(static m => m.Sender)
                .WithMany(static u => u.SentMessages)
                .HasForeignKey(static m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(static m => m.Receiver)
                .WithMany(static u => u.ReceivedMessages)
                .HasForeignKey(static m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(static r => r.Reviewer)
                .WithMany(static u => u.GivenReviews)
                .HasForeignKey(static r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(static r => r.Reviewee)
                .WithMany(static u => u.ReceivedReviews)
                .HasForeignKey(static r => r.RevieweeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMember>()
                .HasKey(static gm => new { gm.GroupId, gm.UserId });

            modelBuilder.Entity<GroupMember>()
                .HasOne(static gm => gm.User)
                .WithMany(static u => u.GroupMemberships)
                .HasForeignKey(static gm => gm.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Comment>()
                .HasOne(static c => c.ParentComment)
                .WithMany(static c => c.Replies)
                .HasForeignKey(static c => c.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostMedia>()
                .HasOne(static pm => pm.Post)
                .WithMany(static p => p.Media)
                .HasForeignKey(static pm => pm.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommentMedia>()
                .HasOne(static cm => cm.Comment)
                .WithMany(static c => c.Media)
                .HasForeignKey(static cm => cm.CommentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Company>()
                .HasOne(static c => c.Owner)
                .WithMany(static u => u.OwnedCompanies)
                .HasForeignKey(static c => c.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CompanyFollower>()
                .HasKey(static cf => new { cf.CompanyId, cf.UserId });

            modelBuilder.Entity<CompanyFollower>()
                .HasOne(static cf => cf.Company)
                .WithMany(static c => c.Followers)
                .HasForeignKey(static cf => cf.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CompanyFollower>()
                .HasOne(static cf => cf.User)
                .WithMany(static u => u.FollowedCompanies)
                .HasForeignKey(static cf => cf.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<QuestionTag>()
                .HasKey(static qt => new { qt.QuestionId, qt.TagId });

            modelBuilder.Entity<UserBadge>()
                .HasKey(static ub => new { ub.UserId, ub.BadgeId });

            modelBuilder.Entity<Agency>()
                .HasOne(static a => a.Owner)
                .WithMany(static u => u.OwnedAgencies)
                .HasForeignKey(static a => a.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AgencyMember>()
                .HasKey(static am => new { am.AgencyId, am.UserId });

            modelBuilder.Entity<AgencyMember>()
                .HasOne(static am => am.Agency)
                .WithMany(static a => a.Members)
                .HasForeignKey(static am => am.AgencyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AgencyMember>()
                .HasOne(static am => am.User)
                .WithMany(static u => u.AgencyMemberships)
                .HasForeignKey(static am => am.UserId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Connection>()
                .HasOne(static c => c.Requester)
                .WithMany(static u => u.ConnectionsRequested)
                .HasForeignKey(static c => c.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Connection>()
                .HasOne(static c => c.Addressee)
                .WithMany(static u => u.ConnectionsReceived)
                .HasForeignKey(static c => c.AddresseeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Endorsement>()
                .HasOne(static e => e.Endorser)
                .WithMany(static u => u.EndorsementsGiven)
                .HasForeignKey(static e => e.EndorserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Endorsement>()
                .HasOne(static e => e.Endorsee)
                .WithMany(static u => u.EndorsementsReceived)
                .HasForeignKey(static e => e.EndorseeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bounty>()
                .HasOne(static b => b.Awarder)
                .WithMany(static u => u.BountiesAwarded)
                .HasForeignKey(static b => b.AwarderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bounty>()
                .HasOne(static b => b.Winner)
                .WithMany(static u => u.BountiesWon)
                .HasForeignKey(static b => b.WinnerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Vote>()
                .HasOne(static v => v.User)
                .WithMany(static u => u.Votes)
                .HasForeignKey(static v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(static t => t.User)
                .WithMany(static u => u.Transactions)
                .HasForeignKey(static t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasOne(static d => d.Issuer)
                .WithMany(static u => u.Disputes)
                .HasForeignKey(static d => d.IssuerId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Global User Relationship Constraints (Avoid Circular Cascades) ──
            modelBuilder.Entity<Post>()
                .HasOne(static p => p.User)
                .WithMany(static u => u.Posts)
                .HasForeignKey(static p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comment>()
                .HasOne(static c => c.User)
                .WithMany(static u => u.Comments)
                .HasForeignKey(static c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Reaction>()
                .HasOne(static r => r.User)
                .WithMany(static u => u.Reactions)
                .HasForeignKey(static r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Question>()
                .HasOne(static q => q.User)
                .WithMany(static u => u.Questions)
                .HasForeignKey(static q => q.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Answer>()
                .HasOne(static a => a.User)
                .WithMany(static u => u.Answers)
                .HasForeignKey(static a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Job>()
                .HasOne(static j => j.Employer)
                .WithMany(static u => u.PostedJobs)
                .HasForeignKey(static j => j.EmployerId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Role Seeding ──
            var adminRoleId = new Guid("A78B3F5C-1E9D-4C62-BB74-92A3D1E4F8C1");
            var employerRoleId = new Guid("B2C3D4E5-F6A7-4B8C-9D0E-1F2A3B4C5D6E");
            var freelancerRoleId = new Guid("C3D4E5F6-A7B8-4C9D-0E1F-2A3B4C5D6E7F");

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = adminRoleId, Name = "Admin", Description = "Full system administration access." },
                new Role { Id = employerRoleId, Name = "Employer", Description = "Can post jobs, manage applications, and hire freelancers." },
                new Role { Id = freelancerRoleId, Name = "Freelancer", Description = "Can apply for jobs, deliver projects, and earn reputation." }
            );
        }
    }
}
