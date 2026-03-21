using AutoMapper;
using FutureConnection.Core.DTOs;
using FutureConnection.Core.Entities;

namespace FutureConnection.Core.Mappers
{
    public class AppProfile : Profile
    {
        public AppProfile()
        {
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role != null ? src.Role.Name : null))
                .ReverseMap()
                .ForMember(dest => dest.Role, opt => opt.Ignore());  // Role is navigation property, not set from string
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));
            CreateMap<LoginUserDto, User>();

            CreateMap<CV, CVDto>().ReverseMap();
            CreateMap<CreateCVDto, CV>();
            CreateMap<UpdateCVDto, CV>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<PersonalProject, PersonalProjectDto>().ReverseMap();
            CreateMap<CreatePersonalProjectDto, PersonalProject>();
            CreateMap<UpdatePersonalProjectDto, PersonalProject>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Connection, ConnectionDto>().ReverseMap();
            CreateMap<CreateConnectionDto, Connection>();
            CreateMap<UpdateConnectionDto, Connection>();

            CreateMap<Endorsement, EndorsementDto>().ReverseMap();
            CreateMap<CreateEndorsementDto, Endorsement>();

            CreateMap<Certificate, CertificateDto>().ReverseMap();
            CreateMap<CreateCertificateDto, Certificate>();
            CreateMap<UpdateCertificateDto, Certificate>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<SocialMedia, SocialMediaDto>().ReverseMap();
            CreateMap<CreateSocialMediaDto, SocialMedia>();
            CreateMap<UpdateSocialMediaDto, SocialMedia>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Job, JobDto>().ReverseMap();
            CreateMap<CreateJobDto, Job>();
            CreateMap<UpdateJobDto, Job>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<JobTag, JobTagDto>().ReverseMap();
            CreateMap<CreateJobTagDto, JobTag>();

            CreateMap<JobType, JobTypeDto>().ReverseMap();
            CreateMap<CreateJobTypeDto, JobType>();
            CreateMap<UpdateJobTypeDto, JobType>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Application, ApplicationDto>().ReverseMap();
            CreateMap<CreateApplicationDto, Application>();
            CreateMap<UpdateApplicationDto, Application>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Post, PostDto>().ReverseMap();
            CreateMap<CreatePostDto, Post>();
            CreateMap<UpdatePostDto, Post>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<PostTag, PostTagDto>().ReverseMap();
            CreateMap<CreatePostTagDto, PostTag>();

            CreateMap<Comment, CommentDto>().ReverseMap();
            CreateMap<CreateCommentDto, Comment>();
            CreateMap<UpdateCommentDto, Comment>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Reaction, ReactionDto>().ReverseMap();
            CreateMap<CreateReactionDto, Reaction>();

            CreateMap<Message, MessageDto>().ReverseMap();
            CreateMap<CreateMessageDto, Message>();
            CreateMap<UpdateMessageDto, Message>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Channel, ChannelDto>().ReverseMap();
            CreateMap<CreateChannelDto, Channel>();
            CreateMap<UpdateChannelDto, Channel>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Group, GroupDto>().ReverseMap();
            CreateMap<CreateGroupDto, Group>();
            CreateMap<UpdateGroupDto, Group>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<GroupMember, GroupMemberDto>().ReverseMap();
            CreateMap<CreateGroupMemberDto, GroupMember>();
            CreateMap<UpdateGroupMemberDto, GroupMember>();

            CreateMap<Question, QuestionDto>().ReverseMap();
            CreateMap<CreateQuestionDto, Question>();
            CreateMap<UpdateQuestionDto, Question>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Answer, AnswerDto>().ReverseMap();
            CreateMap<CreateAnswerDto, Answer>();
            CreateMap<UpdateAnswerDto, Answer>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Vote, VoteDto>().ReverseMap();
            CreateMap<CreateVoteDto, Vote>();

            CreateMap<Reputation, ReputationDto>().ReverseMap();

            CreateMap<Badge, BadgeDto>().ReverseMap();
            CreateMap<CreateBadgeDto, Badge>();

            CreateMap<UserBadge, UserBadgeDto>().ReverseMap();

            CreateMap<Bounty, BountyDto>().ReverseMap();
            CreateMap<CreateBountyDto, Bounty>();

            CreateMap<QuestionTag, QuestionTagDto>().ReverseMap();

            CreateMap<Agency, AgencyDto>().ReverseMap();
            CreateMap<CreateAgencyDto, Agency>();
            CreateMap<UpdateAgencyDto, Agency>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<AgencyMember, AgencyMemberDto>().ReverseMap();
            CreateMap<CreateAgencyMemberDto, AgencyMember>();

            CreateMap<Contract, ContractDto>().ReverseMap();
            CreateMap<CreateContractDto, Contract>();
            CreateMap<UpdateContractDto, Contract>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<ContractMilestone, ContractMilestoneDto>().ReverseMap();
            CreateMap<CreateContractMilestoneDto, ContractMilestone>();
            CreateMap<UpdateContractMilestoneDto, ContractMilestone>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Transaction, TransactionDto>().ReverseMap();

            CreateMap<Dispute, DisputeDto>().ReverseMap();
            CreateMap<CreateDisputeDto, Dispute>();
            CreateMap<UpdateDisputeDto, Dispute>().ForAllMembers(static opts => opts.Condition(static (src, dest, srcMember) => srcMember != null));

            CreateMap<Review, ReviewDto>().ReverseMap();
            CreateMap<CreateReviewDto, Review>();

            CreateMap<Company, CompanyDto>().ReverseMap();
            CreateMap<CreateCompanyDto, Company>();
            CreateMap<UpdateCompanyDto, Company>().ForAllMembers(static opts => opts.Condition(static (__, _, srcMember) => srcMember != null));

            CreateMap<CompanyFollower, CompanyFollowerDto>().ReverseMap();
            CreateMap<CreateCompanyFollowerDto, CompanyFollower>();

            CreateMap<Tag, TagDto>().ReverseMap();
            CreateMap<CreateTagDto, Tag>();

            CreateMap<CodeLanguage, CodeLanguageDto>().ReverseMap();
            CreateMap<CreateCodeLanguageDto, CodeLanguage>();

            CreateMap<Framework, FrameworkDto>().ReverseMap();
            CreateMap<CreateFrameworkDto, Framework>();

            CreateMap<FrameworkType, FrameworkTypeDto>().ReverseMap();
            CreateMap<CreateFrameworkTypeDto, FrameworkType>();

            CreateMap<Major, MajorDto>().ReverseMap();
            CreateMap<CreateMajorDto, Major>();

            CreateMap<Role, RoleDto>().ReverseMap();
            CreateMap<CreateRoleDto, Role>();

            CreateMap<ProjectRole, ProjectRoleDto>().ReverseMap();
            CreateMap<CreateProjectRoleDto, ProjectRole>();

            CreateMap<OpenSourceContribution, OpenSourceContributionDto>().ReverseMap();
            CreateMap<CreateOpenSourceContributionDto, OpenSourceContribution>();

            CreateMap<RefreshToken, RefreshTokenDto>().ReverseMap();

            CreateMap<BlacklistedToken, BlacklistedTokenDto>().ReverseMap();
        }
    }
}
