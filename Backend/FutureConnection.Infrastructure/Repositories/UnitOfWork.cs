using FutureConnection.Core.Interfaces.Repositories;
using FutureConnection.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace FutureConnection.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly FutureConnectionDbContext _context;
    private IDbContextTransaction? _transaction;

    public UnitOfWork(FutureConnectionDbContext context)
    {
        _context = context;
        Users = new UserRepository(_context);
        Agencies = new AgencyRepository(_context);
        AgencyMembers = new AgencyMemberRepository(_context);
        Answers = new AnswerRepository(_context);
        Applications = new ApplicationRepository(_context);
        Badges = new BadgeRepository(_context);
        BlacklistedTokens = new BlacklistedTokenRepository(_context);
        Bounties = new BountyRepository(_context);
        CVs = new CVRepository(_context);
        Certificates = new CertificateRepository(_context);
        Channels = new ChannelRepository(_context);
        CodeLanguages = new CodeLanguageRepository(_context);
        Comments = new CommentRepository(_context);
        CommentMedia = new CommentMediaRepository(_context);
        Companies = new CompanyRepository(_context);
        CompanyFollowers = new CompanyFollowerRepository(_context);
        Connections = new ConnectionRepository(_context);
        Contracts = new ContractRepository(_context);
        ContractMilestones = new ContractMilestoneRepository(_context);
        Disputes = new DisputeRepository(_context);
        Endorsements = new EndorsementRepository(_context);
        Frameworks = new FrameworkRepository(_context);
        FrameworkTypes = new FrameworkTypeRepository(_context);
        Groups = new GroupRepository(_context);
        GroupMembers = new GroupMemberRepository(_context);
        Jobs = new JobRepository(_context);
        JobTags = new JobTagRepository(_context);
        JobTypes = new JobTypeRepository(_context);
        Majors = new MajorRepository(_context);
        Messages = new MessageRepository(_context);
        OpenSourceContributions = new OpenSourceContributionRepository(_context);
        PersonalProjects = new PersonalProjectRepository(_context);
        Posts = new PostRepository(_context);
        PostMedia = new PostMediaRepository(_context);
        PostTags = new PostTagRepository(_context);
        ProjectRoles = new ProjectRoleRepository(_context);
        Questions = new QuestionRepository(_context);
        QuestionTags = new QuestionTagRepository(_context);
        Reactions = new ReactionRepository(_context);
        RefreshTokens = new RefreshTokenRepository(_context);
        Reputations = new ReputationRepository(_context);
        Reviews = new ReviewRepository(_context);
        Roles = new RoleRepository(_context);
        SocialMediaLinks = new SocialMediaRepository(_context);
        Tags = new TagRepository(_context);
        Transactions = new TransactionRepository(_context);
        UserBadges = new UserBadgeRepository(_context);
        Votes = new VoteRepository(_context);
        SupportTickets = new SupportTicketRepository(_context);
        Policies = new PolicyRepository(_context);
        FAQs = new FAQRepository(_context);
        UserLanguages = new UserLanguageRepository(_context);
        UserFrameworks = new UserFrameworkRepository(_context);
    }

    public IUserRepository Users { get; }
    public IAgencyRepository Agencies { get; }
    public IAgencyMemberRepository AgencyMembers { get; }
    public IAnswerRepository Answers { get; }
    public IApplicationRepository Applications { get; }
    public IBadgeRepository Badges { get; }
    public IBlacklistedTokenRepository BlacklistedTokens { get; }
    public IBountyRepository Bounties { get; }
    public ICVRepository CVs { get; }
    public ICertificateRepository Certificates { get; }
    public IChannelRepository Channels { get; }
    public ICodeLanguageRepository CodeLanguages { get; }
    public ICommentRepository Comments { get; }
    public ICommentMediaRepository CommentMedia { get; }
    public ICompanyRepository Companies { get; }
    public ICompanyFollowerRepository CompanyFollowers { get; }
    public IConnectionRepository Connections { get; }
    public IContractRepository Contracts { get; }
    public IContractMilestoneRepository ContractMilestones { get; }
    public IDisputeRepository Disputes { get; }
    public IEndorsementRepository Endorsements { get; }
    public IFrameworkRepository Frameworks { get; }
    public IFrameworkTypeRepository FrameworkTypes { get; }
    public IGroupRepository Groups { get; }
    public IGroupMemberRepository GroupMembers { get; }
    public IJobRepository Jobs { get; }
    public IJobTagRepository JobTags { get; }
    public IJobTypeRepository JobTypes { get; }
    public IMajorRepository Majors { get; }
    public IMessageRepository Messages { get; }
    public IOpenSourceContributionRepository OpenSourceContributions { get; }
    public IPersonalProjectRepository PersonalProjects { get; }
    public IPostRepository Posts { get; }
    public IPostMediaRepository PostMedia { get; }
    public IPostTagRepository PostTags { get; }
    public IProjectRoleRepository ProjectRoles { get; }
    public IQuestionRepository Questions { get; }
    public IQuestionTagRepository QuestionTags { get; }
    public IReactionRepository Reactions { get; }
    public IRefreshTokenRepository RefreshTokens { get; }
    public IReputationRepository Reputations { get; }
    public IReviewRepository Reviews { get; }
    public IRoleRepository Roles { get; }
    public ISocialMediaRepository SocialMediaLinks { get; }
    public ITagRepository Tags { get; }
    public ITransactionRepository Transactions { get; }
    public IUserBadgeRepository UserBadges { get; }
    public IVoteRepository Votes { get; }
    public ISupportTicketRepository SupportTickets { get; }
    public IPolicyRepository Policies { get; }
    public IFAQRepository FAQs { get; }
    public IUserLanguageRepository UserLanguages { get; }
    public IUserFrameworkRepository UserFrameworks { get; }

    public async Task<int> CompleteAsync() => await _context.SaveChangesAsync();

    public async Task BeginTransactionAsync() => _transaction = await _context.Database.BeginTransactionAsync();

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _context.Dispose();
        _transaction?.Dispose();
    }
}
