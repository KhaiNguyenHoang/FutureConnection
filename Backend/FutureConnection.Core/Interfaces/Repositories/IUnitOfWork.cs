namespace FutureConnection.Core.Interfaces.Repositories;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IAgencyRepository Agencies { get; }
    IAgencyMemberRepository AgencyMembers { get; }
    IAnswerRepository Answers { get; }
    IApplicationRepository Applications { get; }
    IBadgeRepository Badges { get; }
    IBlacklistedTokenRepository BlacklistedTokens { get; }
    IBountyRepository Bounties { get; }
    ICVRepository CVs { get; }
    ICertificateRepository Certificates { get; }
    IChannelRepository Channels { get; }
    ICodeLanguageRepository CodeLanguages { get; }
    ICommentRepository Comments { get; }
    ICommentMediaRepository CommentMedia { get; }
    ICompanyRepository Companies { get; }
    ICompanyFollowerRepository CompanyFollowers { get; }
    IConnectionRepository Connections { get; }
    IContractRepository Contracts { get; }
    IContractMilestoneRepository ContractMilestones { get; }
    IDisputeRepository Disputes { get; }
    IEndorsementRepository Endorsements { get; }
    IFrameworkRepository Frameworks { get; }
    IFrameworkTypeRepository FrameworkTypes { get; }
    IGroupRepository Groups { get; }
    IGroupMemberRepository GroupMembers { get; }
    IJobRepository Jobs { get; }
    IJobTagRepository JobTags { get; }
    IJobTypeRepository JobTypes { get; }
    IMajorRepository Majors { get; }
    IMessageRepository Messages { get; }
    IOpenSourceContributionRepository OpenSourceContributions { get; }
    IPersonalProjectRepository PersonalProjects { get; }
    IPostRepository Posts { get; }
    IPostMediaRepository PostMedia { get; }
    IPostTagRepository PostTags { get; }
    IProjectRoleRepository ProjectRoles { get; }
    IQuestionRepository Questions { get; }
    IQuestionTagRepository QuestionTags { get; }
    IReactionRepository Reactions { get; }
    IRefreshTokenRepository RefreshTokens { get; }
    IReputationRepository Reputations { get; }
    IReviewRepository Reviews { get; }
    IRoleRepository Roles { get; }
    ISocialMediaRepository SocialMediaLinks { get; }
    ITagRepository Tags { get; }
    ITransactionRepository Transactions { get; }
    IUserBadgeRepository UserBadges { get; }
    IVoteRepository Votes { get; }

    Task<int> CompleteAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
