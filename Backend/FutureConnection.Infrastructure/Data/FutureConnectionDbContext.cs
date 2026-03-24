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
        public DbSet<UserLanguage> UserLanguages { get; set; }
        public DbSet<UserFramework> UserFrameworks { get; set; }
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
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<Policy> Policies { get; set; }
        public DbSet<FAQ> FAQs { get; set; }
        public DbSet<QuestionMedia> QuestionMedia { get; set; }
        public DbSet<AnswerMedia> AnswerMedia { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Global Soft Delete Filter ──
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
                }
            }

            // ── Database Indexing ──
            modelBuilder.Entity<User>().HasIndex(static u => u.Email).IsUnique();
            modelBuilder.Entity<Job>().HasIndex(static j => j.Title);
            modelBuilder.Entity<Post>().HasIndex(static p => p.Title);
            modelBuilder.Entity<Question>().HasIndex(static q => q.Title);

            // ── Join Table Keys ──
            modelBuilder.Entity<PostTag>().HasKey(static pt => new { pt.PostId, pt.TagId });
            modelBuilder.Entity<JobTag>().HasKey(static jt => new { jt.JobId, jt.TagId });
            modelBuilder.Entity<QuestionTag>().HasKey(static qt => new { qt.QuestionId, qt.TagId });
            modelBuilder.Entity<UserBadge>().HasKey(static ub => new { ub.UserId, ub.BadgeId });
            modelBuilder.Entity<AgencyMember>().HasKey(static am => new { am.AgencyId, am.UserId });
            modelBuilder.Entity<GroupMember>().HasKey(static gm => new { gm.GroupId, gm.UserId });
            modelBuilder.Entity<CompanyFollower>().HasKey(static cf => new { cf.CompanyId, cf.UserId });
            modelBuilder.Entity<UserLanguage>().HasKey(static ul => new { ul.UserId, ul.CodeLanguageId });
            modelBuilder.Entity<UserFramework>().HasKey(static uf => new { uf.UserId, uf.FrameworkId });

            // ── Relationships & Constraints ──
            modelBuilder.Entity<Application>()
                .HasOne(static a => a.Applicant).WithMany(static u => u.Applications).HasForeignKey(static a => a.ApplicantId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Application>()
                .HasOne(static a => a.Job).WithMany(static j => j.Applications).HasForeignKey(static a => a.JobId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(static c => c.Employer).WithMany(static u => u.EmployerContracts).HasForeignKey(static c => c.EmployerId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Contract>()
                .HasOne(static c => c.Freelancer).WithMany(static u => u.FreelancerContracts).HasForeignKey(static c => c.FreelancerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(static m => m.Sender).WithMany(static u => u.SentMessages).HasForeignKey(static m => m.SenderId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Message>()
                .HasOne(static m => m.Receiver).WithMany(static u => u.ReceivedMessages).HasForeignKey(static m => m.ReceiverId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(static r => r.Reviewer).WithMany(static u => u.GivenReviews).HasForeignKey(static r => r.ReviewerId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Review>()
                .HasOne(static r => r.Reviewee).WithMany(static u => u.ReceivedReviews).HasForeignKey(static r => r.RevieweeId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Connection>()
                .HasOne(static c => c.Requester).WithMany(static u => u.ConnectionsRequested).HasForeignKey(static c => c.RequesterId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Connection>()
                .HasOne(static c => c.Addressee).WithMany(static u => u.ConnectionsReceived).HasForeignKey(static c => c.AddresseeId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Endorsement>()
                .HasOne(static e => e.Endorser).WithMany(static u => u.EndorsementsGiven).HasForeignKey(static e => e.EndorserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Endorsement>()
                .HasOne(static e => e.Endorsee).WithMany(static u => u.EndorsementsReceived).HasForeignKey(static e => e.EndorseeId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Bounty>()
                .HasOne(static b => b.Awarder).WithMany(static u => u.BountiesAwarded).HasForeignKey(static b => b.AwarderId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Bounty>()
                .HasOne(static b => b.Winner).WithMany(static u => u.BountiesWon).HasForeignKey(static b => b.WinnerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Post>()
                .HasOne(static p => p.User).WithMany(static u => u.Posts).HasForeignKey(static p => p.UserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Comment>()
                .HasOne(static c => c.User).WithMany(static u => u.Comments).HasForeignKey(static c => c.UserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Question>()
                .HasOne(static q => q.User).WithMany(static u => u.Questions).HasForeignKey(static q => q.UserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Answer>()
                .HasOne(static a => a.User).WithMany(static u => u.Answers).HasForeignKey(static a => a.UserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Job>()
                .HasOne(static j => j.Employer).WithMany(static u => u.PostedJobs).HasForeignKey(static j => j.EmployerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Vote>()
                .HasOne(static v => v.User).WithMany(static u => u.Votes).HasForeignKey(static v => v.UserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Transaction>()
                .HasOne(static t => t.User).WithMany(static u => u.Transactions).HasForeignKey(static t => t.UserId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Dispute>()
                .HasOne(static d => d.Issuer).WithMany(static u => u.Disputes).HasForeignKey(static d => d.IssuerId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<SupportTicket>()
                .HasOne(static st => st.User).WithMany().HasForeignKey(static st => st.UserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Comment>()
                .HasOne(static c => c.ParentComment).WithMany(static c => c.Replies).HasForeignKey(static c => c.ParentCommentId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostMedia>()
                .HasOne(static pm => pm.Post).WithMany(static p => p.Media).HasForeignKey(static pm => pm.PostId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CommentMedia>()
                .HasOne(static cm => cm.Comment).WithMany(static c => c.Media).HasForeignKey(static cm => cm.CommentId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<QuestionMedia>()
                .HasOne(static qm => qm.Question).WithMany(static q => q.Media).HasForeignKey(static qm => qm.QuestionId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AnswerMedia>()
                .HasOne(static am => am.Answer).WithMany(static a => a.Media).HasForeignKey(static am => am.AnswerId).OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Company>()
                .HasOne(static c => c.Owner).WithMany(static u => u.OwnedCompanies).HasForeignKey(static c => c.OwnerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CompanyFollower>()
                .HasOne(static cf => cf.Company).WithMany(static c => c.Followers).HasForeignKey(static cf => cf.CompanyId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<CompanyFollower>()
                .HasOne(static cf => cf.User).WithMany(static u => u.FollowedCompanies).HasForeignKey(static cf => cf.UserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Agency>()
                .HasOne(static a => a.Owner).WithMany(static u => u.OwnedAgencies).HasForeignKey(static a => a.OwnerId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AgencyMember>()
                .HasOne(static am => am.Agency).WithMany(static a => a.Members).HasForeignKey(static am => am.AgencyId).OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<AgencyMember>()
                .HasOne(static am => am.User).WithMany(static u => u.AgencyMemberships).HasForeignKey(static am => am.UserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupMember>()
                .HasOne(static gm => gm.User).WithMany(static u => u.GroupMemberships).HasForeignKey(static gm => gm.UserId).OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PostTag>()
                .HasOne(static pt => pt.Post).WithMany(static p => p.PostTags).HasForeignKey(static pt => pt.PostId);
            modelBuilder.Entity<PostTag>()
                .HasOne(static pt => pt.Tag).WithMany(static t => t.PostTags).HasForeignKey(static pt => pt.TagId);

            modelBuilder.Entity<Framework>()
                .HasMany(f => f.FrameworkTypes)
                .WithMany(ft => ft.Frameworks)
                .UsingEntity<Dictionary<string, object>>(
                    "FrameworkFrameworkTypes",
                    j => j.HasOne<FrameworkType>().WithMany().HasForeignKey("FrameworkTypesId"),
                    j => j.HasOne<Framework>().WithMany().HasForeignKey("FrameworksId"),
                    j => j.HasKey("FrameworksId", "FrameworkTypesId")
                );

            modelBuilder.Entity<Framework>()
                .HasOne(f => f.Language)
                .WithMany(cl => cl.Frameworks)
                .HasForeignKey(f => f.LanguageId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<UserLanguage>()
                .HasOne(ul => ul.CodeLanguage)
                .WithMany()
                .HasForeignKey(ul => ul.CodeLanguageId);

            modelBuilder.Entity<UserFramework>()
                .HasOne(uf => uf.Framework)
                .WithMany()
                .HasForeignKey(uf => uf.FrameworkId);

            // ── Decimal Precision Configuration ──
            modelBuilder.Entity<Application>().Property(a => a.ProposedPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Contract>().Property(c => c.AgreedPrice).HasPrecision(18, 2);
            modelBuilder.Entity<ContractMilestone>().Property(cm => cm.Amount).HasPrecision(18, 2);
            modelBuilder.Entity<Job>().Property(j => j.Budget).HasPrecision(18, 2);
            modelBuilder.Entity<Job>().Property(j => j.SalaryMax).HasPrecision(18, 2);
            modelBuilder.Entity<Job>().Property(j => j.SalaryMin).HasPrecision(18, 2);
            modelBuilder.Entity<Transaction>().Property(t => t.Amount).HasPrecision(18, 2);

            // ── Role Seeding ──
            var adminRoleId = new Guid("A78B3F5C-1E9D-4C62-BB74-92A3D1E4F8C1");
            var employerRoleId = new Guid("B2C3D4E5-F6A7-4B8C-9D0E-1F2A3B4C5D6E");
            var freelancerRoleId = new Guid("C3D4E5F6-A7B8-4C9D-0E1F-2A3B4C5D6E7F");

            modelBuilder.Entity<Role>().HasData(
                new Role { Id = adminRoleId, Name = "Admin", Description = "Full system administration access." },
                new Role { Id = employerRoleId, Name = "Employer", Description = "Can post jobs, manage applications, and hire freelancers." },
                new Role { Id = freelancerRoleId, Name = "Freelancer", Description = "Can apply for jobs, deliver projects, and earn reputation." }
            );

            // ── Policy Seeding ──
            modelBuilder.Entity<Policy>().HasData(
                new Policy 
                { 
                    Id = new Guid("11111111-1111-1111-1111-111111111111"), 
                    Title = "Privacy Shield Protocol", 
                    Type = "privacy", 
                    Version = "1.0.0",
                    Content = "# Privacy Shield Protocol\n\nYour data is protected by high-level encryption standards."
                },
                new Policy 
                { 
                    Id = new Guid("22222222-2222-2222-2222-222222222222"), 
                    Title = "Terms of System Operation", 
                    Type = "terms", 
                    Version = "1.0.0",
                    Content = "# Terms of System Operation\n\nBy accessing FutureConnection, you agree to abide by the industrial standards of professional conduct."
                }
            );

            // ── FAQ Seeding ──
            modelBuilder.Entity<FAQ>().HasData(
                new FAQ { Id = Guid.NewGuid(), Question = "How do I secure my neural link?", Answer = "Use multi-factor authentication.", Category = "Security", DisplayOrder = 1 },
                new FAQ { Id = Guid.NewGuid(), Question = "What is the Smart Matching algorithm?", Answer = "It uses high-frequency analysis.", Category = "General", DisplayOrder = 2 }
            );

            // ── Dev Ecosystem Seeding ──
            var webFrontendTypeId = new Guid("F0010001-0001-0001-0001-000000000001");
            var webBackendTypeId = new Guid("F0010001-0001-0001-0001-000000000002");
            var mobileTypeId = new Guid("F0010001-0001-0001-0001-000000000003");
            var desktopTypeId = new Guid("F0010001-0001-0001-0001-000000000004");

            modelBuilder.Entity<FrameworkType>().HasData(
                new FrameworkType { Id = webFrontendTypeId, Name = "Web_Frontend", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new FrameworkType { Id = webBackendTypeId, Name = "Web_Backend", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new FrameworkType { Id = mobileTypeId, Name = "Mobile", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new FrameworkType { Id = desktopTypeId, Name = "Desktop", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            var jsLangId = new Guid("A0010001-0001-0001-0001-000000000001");
            var tsLangId = new Guid("A0010001-0001-0001-0001-000000000002");
            var pythonLangId = new Guid("A0010001-0001-0001-0001-000000000003");
            var csharpLangId = new Guid("A0010001-0001-0001-0001-000000000004");
            var javaLangId = new Guid("A0010001-0001-0001-0001-000000000005");
            var rustLangId = new Guid("A0010001-0001-0001-0001-000000000006");

            modelBuilder.Entity<CodeLanguage>().HasData(
                new CodeLanguage { Id = jsLangId, Name = "JavaScript", DocumentationUrl = "https://developer.mozilla.org/en-US/docs/Web/JavaScript", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new CodeLanguage { Id = tsLangId, Name = "TypeScript", DocumentationUrl = "https://www.typescriptlang.org/docs/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new CodeLanguage { Id = pythonLangId, Name = "Python", DocumentationUrl = "https://docs.python.org/3/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new CodeLanguage { Id = csharpLangId, Name = "C#", DocumentationUrl = "https://learn.microsoft.com/en-us/dotnet/csharp/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new CodeLanguage { Id = javaLangId, Name = "Java", DocumentationUrl = "https://docs.oracle.com/en/java/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new CodeLanguage { Id = rustLangId, Name = "Rust", DocumentationUrl = "https://doc.rust-lang.org/book/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            // ── Framework Seeding ──
            var reactId = new Guid("B0010001-0001-0001-0001-000000000001");
            var nextjsId = new Guid("B0010001-0001-0001-0001-000000000002");
            var vuejsId = new Guid("B0010001-0001-0001-0001-000000000003");
            var angularId = new Guid("B0010001-0001-0001-0001-000000000004");
            var dotnetId = new Guid("B0010001-0001-0001-0001-000000000005");
            var djangoId = new Guid("B0010001-0001-0001-0001-000000000006");
            var springBootId = new Guid("B0010001-0001-0001-0001-000000000007");

            modelBuilder.Entity<Framework>().HasData(
                new Framework { Id = reactId, Name = "React", LanguageId = jsLangId, DocumentationUrl = "https://react.dev/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Framework { Id = nextjsId, Name = "Next.js", LanguageId = tsLangId, DocumentationUrl = "https://nextjs.org/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Framework { Id = vuejsId, Name = "Vue.js", LanguageId = jsLangId, DocumentationUrl = "https://vuejs.org/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Framework { Id = angularId, Name = "Angular", LanguageId = tsLangId, DocumentationUrl = "https://angular.io/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Framework { Id = dotnetId, Name = ".NET", LanguageId = csharpLangId, DocumentationUrl = "https://dotnet.microsoft.com/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Framework { Id = djangoId, Name = "Django", LanguageId = pythonLangId, DocumentationUrl = "https://www.djangoproject.com/", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Framework { Id = springBootId, Name = "Spring Boot", LanguageId = javaLangId, DocumentationUrl = "https://spring.io/projects/spring-boot", CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );

            // ── Framework-FrameworkType Join Seeding ──
            modelBuilder.Entity("FrameworkFrameworkTypes").HasData(
                new { FrameworksId = reactId, FrameworkTypesId = webFrontendTypeId },
                new { FrameworksId = nextjsId, FrameworkTypesId = webFrontendTypeId },
                new { FrameworksId = nextjsId, FrameworkTypesId = webBackendTypeId },
                new { FrameworksId = vuejsId, FrameworkTypesId = webFrontendTypeId },
                new { FrameworksId = angularId, FrameworkTypesId = webFrontendTypeId },
                new { FrameworksId = dotnetId, FrameworkTypesId = webBackendTypeId },
                new { FrameworksId = djangoId, FrameworkTypesId = webBackendTypeId },
                new { FrameworksId = springBootId, FrameworkTypesId = webBackendTypeId }
            );
        }

        private static System.Linq.Expressions.LambdaExpression ConvertFilterExpression(Type type)
        {
            var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
            var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
            var notExpression = System.Linq.Expressions.Expression.Not(property);
            return System.Linq.Expressions.Expression.Lambda(notExpression, parameter);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker
                .Entries()
                .Where(static e => e.Entity is BaseEntity && (e.State == EntityState.Added || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                ((BaseEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;

                if (entityEntry.State == EntityState.Added)
                {
                    ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
