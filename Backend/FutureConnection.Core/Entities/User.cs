namespace FutureConnection.Core.Entities
{
    public class User : BaseEntity
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Email { get; set; }
        public required string HashedPassword { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Salt { get; set; }
        public Guid RoleId { get; set; }
        public required Role Role { get; set; }
        public Guid? SocialMediaId { get; set; }
        public SocialMedia? SocialMedia { get; set; }
        public string? LastLoginIp { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public bool IsOnboarded { get; set; }
        public string? ResetPasswordToken { get; set; }
        public DateTime? ResetPasswordTokenExpiry { get; set; }

        // Email Verification
        public bool IsEmailVerified { get; set; } = false;
        public string? EmailVerificationToken { get; set; }
        public DateTime? EmailVerificationTokenExpiry { get; set; }

        // Change Password OTP
        public string? ChangePasswordOtp { get; set; }
        public DateTime? ChangePasswordOtpExpiry { get; set; }

        // OAuth2
        public string? ExternalProvider { get; set; }   // "GitHub", "Google"
        public string? ExternalProviderId { get; set; } // Provider's user ID
        public virtual ICollection<CV> CVs { get; set; } = [];
        public virtual ICollection<PersonalProject> PersonalProjects { get; set; } = [];
        public virtual ICollection<Post> Posts { get; set; } = [];
        public virtual ICollection<Comment> Comments { get; set; } = [];
        public virtual ICollection<Reaction> Reactions { get; set; } = [];
        public virtual ICollection<Job> PostedJobs { get; set; } = [];
        public virtual ICollection<Application> Applications { get; set; } = [];
        public virtual ICollection<GroupMember> GroupMemberships { get; set; } = [];
        public virtual ICollection<Message> SentMessages { get; set; } = [];
        public virtual ICollection<Message> ReceivedMessages { get; set; } = [];
        public virtual ICollection<Contract> EmployerContracts { get; set; } = [];
        public virtual ICollection<Contract> FreelancerContracts { get; set; } = [];
        public virtual ICollection<Review> GivenReviews { get; set; } = [];
        public virtual ICollection<Review> ReceivedReviews { get; set; } = [];

        // LinkedIn Features
        public virtual ICollection<Connection> ConnectionsRequested { get; set; } = [];
        public virtual ICollection<Connection> ConnectionsReceived { get; set; } = [];
        public virtual ICollection<Company> OwnedCompanies { get; set; } = [];
        public virtual ICollection<CompanyFollower> FollowedCompanies { get; set; } = [];
        public virtual ICollection<Endorsement> EndorsementsGiven { get; set; } = [];
        public virtual ICollection<Endorsement> EndorsementsReceived { get; set; } = [];
        public virtual ICollection<Certificate> Certificates { get; set; } = [];

        // StackOverflow Gamification Features
        public virtual ICollection<Question> Questions { get; set; } = [];
        public virtual ICollection<Answer> Answers { get; set; } = [];
        public virtual ICollection<Vote> Votes { get; set; } = [];
        public virtual ICollection<Reputation> Reputations { get; set; } = [];
        public virtual ICollection<UserBadge> UserBadges { get; set; } = [];
        public virtual ICollection<Bounty> BountiesAwarded { get; set; } = [];
        public virtual ICollection<Bounty> BountiesWon { get; set; } = [];

        // Upwork Advanced Features
        public virtual ICollection<Agency> OwnedAgencies { get; set; } = [];
        public virtual ICollection<AgencyMember> AgencyMemberships { get; set; } = [];
        public virtual ICollection<Transaction> Transactions { get; set; } = [];
        public virtual ICollection<Dispute> Disputes { get; set; } = [];

        // OSS & Community Expansions
        public virtual ICollection<OpenSourceContribution> OpenSourceContributions { get; set; } = [];
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    }
}
